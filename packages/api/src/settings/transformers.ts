import { SettingDocument, SettingDto } from './types';
import { PeriodSettingDocument } from '@periodsettings/types';

const settingDocumentToDto = (
  setting: SettingDocument | PeriodSettingDocument
): SettingDto => {
  const { _id, key, value, valueRealized, type, label, description } = setting;
  return { _id, key, value, valueRealized, type, label, description };
};

export const settingListTransformer = (
  settings: SettingDocument[] | PeriodSettingDocument[] | undefined
): SettingDto[] => {
  if (settings && Array.isArray(settings)) {
    return settings.map((setting) => settingDocumentToDto(setting));
  }
  return [];
};

export const settingTransformer = (
  setting: SettingDocument | PeriodSettingDocument
): SettingDto => {
  return settingDocumentToDto(setting);
};
