import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Request } from 'express';
import { Model, Types } from 'mongoose';
import { Setting, SettingDocument } from './schemas/settings.schema';
import { AxiosResponse } from 'axios';
import axios from 'axios';
import { TransformerMapOperateItem } from 'ses-node-json-transform';
import { ExportTransformer } from '@/shared/types.shared';
import { SetSettingDto } from './dto/set-setting.dto';
import { UtilsProvider } from '@/utils/utils.provider';
import { UploadedFile } from 'express-fileupload';
import { PeriodSettingsService } from '@/periodsettings/periodsettings.service';
import { ServiceException } from '@/shared/service-exception';
import { EventLogService } from '@/event-log/event-log.service';
import { EventLogTypeKey } from '@/event-log/enums/event-log-type-key';
import { RequestContext } from 'nestjs-request-context';

@Injectable()
export class SettingsService {
  constructor(
    @InjectModel(Setting.name)
    private settingsModel: Model<Setting>,
    private periodSettingsService: PeriodSettingsService,
    private utils: UtilsProvider,
    private eventLogService: EventLogService,
  ) {}

  /**
   * Convenience method to get the Settings Model
   * @returns
   */
  getModel(): Model<Setting> {
    return this.settingsModel;
  }

  async findAll(): Promise<Setting[]> {
    const settings = await this.settingsModel.find().lean();
    return settings.map((setting) => new Setting(setting));
  }

  async findOneById(_id: Types.ObjectId): Promise<Setting> {
    const setting = await this.settingsModel
      .findOne({
        _id,
        period: { $exists: 0 },
      })
      .lean();

    if (!setting) throw new ServiceException('Settings not found.');
    return new Setting(setting);
  }

  async setOne(_id: Types.ObjectId, data: SetSettingDto): Promise<Setting> {
    const setting = await this.settingsModel.findOne({
      _id,
      period: { $exists: 0 },
    });
    if (!setting) throw new ServiceException('Settings not found.');

    const originalValue = setting.value;
    if (setting.type === 'Image') {
      const req: Request = RequestContext.currentContext.req;
      const file = req.files;
      if (!file) {
        throw new ServiceException('Uploaded file is missing.');
      }

      const logo: UploadedFile = file['value'] as UploadedFile;
      if (!this.utils.isImage(logo)) {
        throw new ServiceException('Uploaded file is not an image.');
      }

      // Remove previous file
      try {
        setting.value && (await this.utils.removeFile(setting.value));
      } catch (err) {
        // Ignore error
      }

      const savedFilename = await this.utils.saveFile(logo);
      setting.value = savedFilename;
    } else {
      if (typeof data.value === 'undefined') {
        throw new ServiceException('Value is required field');
      }
      setting.value = data.value;
    }

    await this.eventLogService.logEvent({
      typeKey: EventLogTypeKey.SETTING,
      description: `Updated global setting "${setting.label}" from "${
        originalValue || ''
      }" to "${setting.value || ''}"`,
    });

    await setting.save();
    return this.findOneById(_id);
  }

  async findCustomExportTransformer() {
    const customExportMapSetting = (await this.settingValue(
      'CUSTOM_EXPORT_MAP',
    )) as string;

    if (!customExportMapSetting) {
      throw new ServiceException('No custom export map specified');
    }

    try {
      let response: AxiosResponse | undefined = undefined;
      try {
        response = await axios.get(customExportMapSetting);
      } catch (error) {
        throw new ServiceException(
          'Could not fetch custom export transformer.',
        );
      }

      if (response) {
        const transformerDto = response.data as ExportTransformer;
        try {
          const transformer: ExportTransformer = {
            ...transformerDto,
            map: {
              item: transformerDto.map.item,
              operate: transformerDto.map.operate.map(
                (operateItem: TransformerMapOperateItem) => {
                  return {
                    run: operateItem.run,
                    on: operateItem.on,
                  };
                },
              ),
              each: transformerDto.map.each,
            },
          };
          return transformer;
        } catch (error) {
          throw new Error('Could not parse custom export transformer.');
        }
      }

      throw new Error('Unknown error');
    } catch (error) {
      throw new ServiceException((error as Error).message);
    }
  }

  async settingValue(
    key: string,
    periodId: Types.ObjectId | undefined = undefined,
  ): Promise<
    string | boolean | number | number[] | string[] | object | undefined
  > {
    let setting;
    if (!periodId) {
      const setting = await this.settingsModel.findOne({
        key,
      });

      if (!setting) {
        throw new ServiceException(`Setting ${key} does not exist`);
      }
    } else {
      setting = await this.periodSettingsService.findOne(key, periodId);

      if (!setting) {
        const periodString = periodId
          ? `period ${periodId.toString()}`
          : 'global';
        throw new ServiceException(
          `periodsetting ${key} does not exist for ${periodString}`,
        );
      }
    }

    return setting ? setting.value : undefined;
  }
}
