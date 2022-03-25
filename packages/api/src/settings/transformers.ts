import { SettingDocument, SettingDto } from './types';

const settingDocumentToDto = (setting: SettingDocument): SettingDto => {
  const { _id, key, value, type, label, description } = setting;
  return { _id, key, value, type, label, description };
};

export const settingListTransformer = (
  settings: SettingDocument[] | undefined
): SettingDto[] => {
  if (settings && Array.isArray(settings)) {
    return settings.map((setting) => settingDocumentToDto(setting));
  }
  return [];
};

export const settingTransformer = (setting: SettingDocument): SettingDto => {
  return settingDocumentToDto(setting);
};
