import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Setting } from './schemas/settings.schema';
import { SetSettingDto } from './dto/set-setting.dto';
import { FileUtilsProvider } from '../settings/providers/file-utils.provider';
import { ApiException } from '../shared/exceptions/api-exception';
import { SettingGroup } from './enums/setting-group.enum';
import { validateSetting } from './utils/validate-setting';
import { SettingsFilterDto } from './dto/settings-filter.dto';
import { errorMessages } from '../shared/exceptions/error-messages';
import { PeriodSetting } from './schemas/periodsettings.schema';
import { SetPeriodSettingDto } from './dto/set-periodsetting.dto';
import { Period } from '../periods/schemas/periods.schema';
import { PeriodStatusType } from '../periods/enums/status-type.enum';
import { logger } from '../shared/logger';
import { deleteFromIpfs, uploadToIpfs } from './utils/pinata-ipfs';

@Injectable()
export class SettingsService {
  constructor(
    @InjectModel(Setting.name)
    private settingsModel: Model<Setting>,
    @InjectModel(PeriodSetting.name)
    private periodSettingsModel: Model<PeriodSetting>,
    @InjectModel(Period.name)
    private periodModel: Model<Period>,
    private utils: FileUtilsProvider,
  ) {}

  /**
   * Convenience method to get the Settings Model
   * @returns
   */
  getSettingsModel(): Model<Setting> {
    return this.settingsModel;
  }

  /**
   * Convenience method to get the PeriodSettings Model
   * @returns
   */
  getPeriodSettingsModel(): Model<PeriodSetting> {
    return this.periodSettingsModel;
  }

  /**
   * Find all settings
   * @returns {Promise<Setting[]>}
   * @throws {ServiceException}
   *
   * */
  async findAll(filter?: SettingsFilterDto): Promise<Setting[]> {
    const query = filter || {};
    return await this.settingsModel.find(query).lean();
  }

  /**
   * Find one setting by id
   * @param _id
   * @returns {Promise<Setting>}
   * @throws {ServiceException}
   *
   * */
  async findOneById(_id: Types.ObjectId): Promise<Setting> {
    const setting = await this.settingsModel
      .findOne({
        _id,
        period: { $exists: 0 },
      })
      .lean();

    if (!setting) throw new ApiException(errorMessages.SETTING_NOT_FOUND);
    return setting;
  }

  /**
   * Find one setting by key or none
   * @param key
   * @returns {Promise<Setting>}
   * @throws {ServiceException}
   *
   * */
  async findOneByKey(key: string): Promise<Setting | null> {
    const setting = await this.settingsModel
      .findOne({
        key,
        period: { $exists: 0 },
      })
      .lean();

    return setting;
  }

  /**
   * Set one setting by id
   * @param key
   * @returns {Promise<Setting>}
   * @throws {ServiceException}
   *
   * */
  async setOne(_id: Types.ObjectId, data: SetSettingDto): Promise<Setting> {
    const setting = await this.settingsModel.findOne({
      _id,
      period: { $exists: 0 },
    });
    if (!setting) throw new ApiException(errorMessages.SETTING_NOT_FOUND);

    if (typeof data.value === 'undefined') {
      throw new ApiException(errorMessages.VALUE_IS_REQUIRED_FIELD_FOR_SETTING);
    }

    const { valid, value: validatedValue } = validateSetting(
      data.value,
      setting.type,
    );
    if (!valid) {
      throw new ApiException(errorMessages.INVALID_VALUE_FIELD_FOR_SETTING);
    }
    setting.value = validatedValue;

    await setting.save();
    return this.findOneById(_id);
  }

  async setImageSetting(
    _id: Types.ObjectId,
    file: Express.Multer.File,
  ): Promise<Setting> {
    const setting = await this.settingsModel.findOne({
      _id,
      period: { $exists: 0 },
    });
    if (!setting) throw new ApiException(errorMessages.SETTING_NOT_FOUND);

    // Only allow image files
    if (!this.utils.isImage(file)) {
      await this.utils.removeFile(file.filename);
      throw new ApiException(errorMessages.UPLOADED_FILE_IS_NOT_AN_IMAGE);
    }

    // Remove previous file if exists
    try {
      await deleteFromIpfs(setting.value);
      await this.utils.removeFile(setting.value);
    } catch (err) {
      // Ignore error
    }

    const ipfsHash = await uploadToIpfs(file);

    // Remove temporary file
    try {
      await this.utils.removeFile(file.filename);
    } catch (err) {
      // Ignore error
    }

    setting.value = ipfsHash;
    await setting.save();

    return this.findOneById(_id);
  }

  /**
   * Find one setting value by key
   * @param key
   * @returns {Promise<Setting>}
   * @throws {ServiceException}
   *
   * */
  async settingValue(
    key: string,
    periodId: Types.ObjectId | undefined = undefined,
  ): Promise<
    string | boolean | number | number[] | string[] | object | undefined
  > {
    let setting;
    if (!periodId) {
      setting = await this.settingsModel
        .findOne({
          key,
        })
        .lean();

      if (!setting) {
        throw new ApiException(errorMessages.SETTING_NOT_FOUND);
      }
    } else {
      const generalSetting = await this.settingsModel
        .findOne({
          key,
        })
        .lean();

      if (generalSetting) {
        setting = await this.periodSettingsModel
          .findOne({ period: periodId, setting: generalSetting._id })
          .lean()
          .populate('period')
          .populate('setting')
          .exec();

        if (!setting) {
          throw new ApiException(errorMessages.SETTING_NOT_FOUND);
        }
      }
    }

    return setting ? setting.value : undefined;
  }

  /**
   * Find settings by group
   * @param group {SettingGroup}
   * @returns {Promise<Setting[]>}
   * @throws {ServiceException}
   * */
  async findByGroup(group: SettingGroup): Promise<Setting[]> {
    return await this.settingsModel
      .find({
        group,
      })
      .lean();
  }

  async findAllPeriodSettings(
    periodId: Types.ObjectId,
  ): Promise<PeriodSetting[]> {
    const settings = await this.periodSettingsModel
      .find({ period: periodId })
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

  async setOnePeriodSetting(
    settingId: Types.ObjectId,
    periodId: Types.ObjectId,
    data: SetPeriodSettingDto,
  ): Promise<PeriodSetting> {
    const setting = await this.findOneById(settingId);
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

    const period = await this.periodModel.findById(periodId).lean();
    if (!period) throw new ApiException(errorMessages.PERIOD_NOT_FOUND);
    if (period.status !== PeriodStatusType.OPEN)
      throw new ApiException(
        errorMessages.PERIOD_SETTING_CAN_BE_CHANGED__WHEN_ITS_OPEN,
      );

    const periodSetting = await this.periodSettingsModel.findOne({
      setting: settingId,
      period: period._id,
    });
    if (!periodSetting)
      throw new ApiException(errorMessages.PERIOD_SETTING_NOT_FOUND);

    const originalValue = periodSetting.value;

    if (typeof data.value === 'undefined') {
      throw new ApiException(errorMessages.VALUE_IS_REQUIRED_FIELD);
    }
    periodSetting.value = validatedValue;

    await periodSetting.save();

    logger.info(
      `Updated period "${period.name}" setting "${setting.label}" from "${
        originalValue || ''
      }" to "${setting.value || ''}"`,
    );

    return this.findOneBySettingIdAndPeriodId(settingId, periodId);
  }

  /**
   * Create period settings for a period based on the default settings found
   * in the settings collection, marked with the PERIOD_DEFAULT group.
   */
  async createSettingsForPeriod(periodId: Types.ObjectId) {
    const settingsAllreadyExist = await this.findAllPeriodSettings(periodId);
    if (settingsAllreadyExist.length > 0) {
      throw new ApiException(
        errorMessages.PERIOD_SETTINGS_ALREADY_EXIST_FOR_THIS_PERIOD,
      );
    }

    const periodSettingsDefaults = await this.findByGroup(
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
