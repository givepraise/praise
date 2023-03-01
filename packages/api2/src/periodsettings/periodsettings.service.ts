import { ServiceException } from '@/shared/exceptions/service-exception';
import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PeriodSetting } from './schemas/periodsettings.schema';
import { SetPeriodSettingDto } from './dto/set-periodsetting.dto';
import { PeriodsService } from '@/periods/services/periods.service';
import { PeriodStatusType } from '@/periods/enums/status-type.enum';
import { EventLogService } from '@/event-log/event-log.service';
import { EventLogTypeKey } from '@/event-log/enums/event-log-type-key';
import { SettingsService } from '@/settings/settings.service';
import { validate } from '@/settings/utils/settings.validate';
import { SettingGroup } from '@/settings/enums/setting-group.enum';

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

    if (!periodSetting) throw new ServiceException('PeriodSetting not found.');
    return new PeriodSetting(periodSetting);
  }

  async setOne(
    settingId: Types.ObjectId,
    periodId: Types.ObjectId,
    data: SetPeriodSettingDto,
  ): Promise<PeriodSetting> {
    const setting = await this.settingsService.findOneById(settingId);
    if (!setting) throw new ServiceException('Setting not found.');
    if (!validate(data.value, setting.type)) {
      throw new ServiceException(
        `Settings value ${data.value} is not valid for type ${setting.type}.`,
      );
    }

    const period = await this.periodsService.findOneById(periodId);
    if (!period) throw new ServiceException('Period not found.');
    if (period.status !== PeriodStatusType.OPEN)
      throw new ServiceException(
        'Period settings can only be changed when period status is OPEN.',
      );

    const periodSetting = await this.periodSettingsModel.findOne({
      setting: settingId,
      period: periodId,
    });
    if (!periodSetting) throw new ServiceException('Period setting not found.');

    const originalValue = periodSetting.value;

    if (typeof data.value === 'undefined') {
      throw new ServiceException('Value is required field');
    }
    periodSetting.value = data.value;

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
      throw new ServiceException(
        'Period settings already exist for this period.',
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
