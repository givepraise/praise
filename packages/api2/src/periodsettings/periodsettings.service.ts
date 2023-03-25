import { ApiException } from '../shared/exceptions/api-exception';
import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PeriodSetting } from './schemas/periodsettings.schema';
import { SetPeriodSettingDto } from './dto/set-periodsetting.dto';
import { PeriodsService } from '../periods/services/periods.service';
import { PeriodStatusType } from '../periods/enums/status-type.enum';
import { EventLogService } from '../event-log/event-log.service';
import { EventLogTypeKey } from '../event-log/enums/event-log-type-key';
import { SettingsService } from '../settings/settings.service';
import { validateSetting } from '../settings/utils/validate-setting';
import { SettingGroup } from '../settings/enums/setting-group.enum';
import { errorMessages } from '../shared/exceptions/error-messages';

@Injectable()
export class PeriodSettingsService {
  constructor(
    @InjectModel(PeriodSetting.name)
    private periodSettingsModel: Model<PeriodSetting>,
    @Inject(forwardRef(() => PeriodsService))
    private periodsService: PeriodsService,
    @Inject(forwardRef(() => SettingsService))
    private settingsService: SettingsService,
    private eventLogService: EventLogService,
  ) {}

  /**
   * Convenience method to get the PeriodSettings Model
   * @returns
   */
  getModel(): Model<PeriodSetting> {
    return this.periodSettingsModel;
  }

  async findAll(periodId: Types.ObjectId): Promise<PeriodSetting[]> {
    const period = await this.periodsService.findOneById(periodId);

    const settings = await this.periodSettingsModel
      .find({ period: period._id })
      .lean()
      .populate('period')
      .populate('setting')
      .exec();
    return settings.map((setting) => new PeriodSetting(setting));
  }

  async findOneBySettingIdAndPeriodId(
    settingId: Types.ObjectId,
    periodId: Types.ObjectId,
  ): Promise<PeriodSetting> {
    const periodSetting = await this.periodSettingsModel
      .findOne({ period: periodId, setting: settingId })
      .lean()
      .populate('period')
      .populate('setting')
      .exec();

    if (!periodSetting)
      throw new ApiException(errorMessages.PERIOD_SETTING_NOT_FOUND);
    return new PeriodSetting(periodSetting);
  }

  async setOne(
    settingId: Types.ObjectId,
    periodId: Types.ObjectId,
    data: SetPeriodSettingDto,
  ): Promise<PeriodSetting> {
    const setting = await this.settingsService.findOneById(settingId);
    if (!setting) throw new ApiException(errorMessages.SETTING_NOT_FOUND);
    const { valid, value: validatedValue } = validateSetting(
      data.value,
      setting.type,
    );
    if (!valid) {
      throw new ApiException(
        errorMessages.INVALID_SETTING_VALUE,
        `Settings value ${data.value} is not valid for type ${setting.type}.`,
      );
    }

    const period = await this.periodsService.findOneById(periodId);
    if (!period) throw new ApiException(errorMessages.PERIOD_NOT_FOUND);
    if (period.status !== PeriodStatusType.OPEN)
      throw new ApiException(
        errorMessages.PERIOD_SETTING_CAN_BE_CHANGED__WHEN_ITS_OPEN,
      );

    const periodSetting = await this.periodSettingsModel.findOne({
      setting: settingId,
      period: periodId,
    });
    if (!periodSetting)
      throw new ApiException(errorMessages.PERIOD_SETTING_NOT_FOUND);

    const originalValue = periodSetting.value;

    if (typeof data.value === 'undefined') {
      throw new ApiException(errorMessages.VALUE_IS_REQUIRED_FIELD);
    }
    periodSetting.value = validatedValue;

    await periodSetting.save();

    await this.eventLogService.logEvent({
      typeKey: EventLogTypeKey.SETTING,
      description: `Updated period "${period.name}" setting "${
        setting.label
      }" from "${originalValue || ''}" to "${setting.value || ''}"`,
    });

    return this.findOneBySettingIdAndPeriodId(settingId, periodId);
  }

  /**
   * Create period settings for a period based on the default settings found
   * in the settings collection, marked with the PERIOD_DEFAULT group.
   */
  async createSettingsForPeriod(periodId: Types.ObjectId) {
    const settingsAllreadyExist = await this.findAll(periodId);
    if (settingsAllreadyExist.length > 0) {
      throw new ApiException(
        errorMessages.PERIOD_SETTINGS_ALREADY_EXIST_FOR_THIS_PERIOD,
      );
    }

    const periodSettingsDefaults = await this.settingsService.findByGroup(
      SettingGroup.PERIOD_DEFAULT,
    );

    const periodSettings = periodSettingsDefaults.map((setting) => {
      return {
        period: periodId,
        setting: setting._id,
        value: setting.value,
      };
    });

    return this.periodSettingsModel.insertMany(periodSettings);
  }
}
