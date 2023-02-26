import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Setting } from './schemas/settings.schema';
import { SetSettingDto } from './dto/set-setting.dto';
import { FileUtilsProvider } from '@/settings/providers/file-utils.provider';
import { ServiceException } from '@/shared/exceptions/service-exception';
import { EventLogService } from '@/event-log/event-log.service';
import { EventLogTypeKey } from '@/event-log/enums/event-log-type-key';
import { SettingGroup } from './enums/setting-group.enum';
import { PeriodSettingsService } from '@/periodsettings/periodsettings.service';
import { validate } from './utils/settings.validate';
import { ConstantsProvider } from '@/constants/constants.provider';

@Injectable()
export class SettingsService {
  constructor(
    @InjectModel(Setting.name)
    private settingsModel: Model<Setting>,
    @Inject(forwardRef(() => PeriodSettingsService))
    private periodSettingsService: PeriodSettingsService,
    private utils: FileUtilsProvider,
    private eventLogService: EventLogService,
  ) {}

  /**
   * Convenience method to get the Settings Model
   * @returns
   */
  getModel(): Model<Setting> {
    return this.settingsModel;
  }

  /**
   * Find all settings
   * @returns {Promise<Setting[]>}
   * @throws {ServiceException}
   *
   * */
  async findAll(): Promise<Setting[]> {
    return await this.settingsModel.find().lean();
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

    if (!setting) throw new ServiceException('Settings not found.');
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
    if (!setting) throw new ServiceException('Settings not found.');

    const originalValue = setting.value;

    if (typeof data.value === 'undefined') {
      throw new ServiceException('Value is required field');
    }
    if (!validate(data.value, setting.type)) {
      throw new ServiceException(
        `Settings value ${data.value} is not valid for type ${setting.type}.`,
      );
    }
    setting.value = data.value;

    await this.eventLogService.logEvent({
      typeKey: EventLogTypeKey.SETTING,
      description: `Updated global setting "${setting.label}" from "${
        originalValue || ''
      }" to "${setting.value || ''}"`,
    });

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
    if (!setting) throw new ServiceException('Settings not found.');

    // Only allow image files
    if (!this.utils.isImage(file)) {
      await this.utils.removeFile(file.filename);
      throw new ServiceException('Uploaded file is not an image.');
    }

    const originalValue = setting.value;

    // Remove previous file
    try {
      await this.utils.removeFile(setting.value);
    } catch (err) {
      // Ignore error
    }

    setting.value = file.filename;

    await this.eventLogService.logEvent({
      typeKey: EventLogTypeKey.SETTING,
      description: `Updated global setting "${setting.label}" from "${
        originalValue || ''
      }" to "${setting.value || ''}"`,
    });

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
        throw new ServiceException(`Setting ${key} does not exist`);
      }
    } else {
      const generalSetting = await this.settingsModel
        .findOne({
          key,
        })
        .lean();

      if (generalSetting) {
        setting =
          await this.periodSettingsService.findOneBySettingIdAndPeriodId(
            generalSetting._id,
            periodId,
          );

        if (!setting) {
          const periodString = periodId
            ? `period ${periodId.toString()}`
            : 'global';
          throw new ServiceException(
            `periodsetting ${key} does not exist for ${periodString}`,
          );
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
}
