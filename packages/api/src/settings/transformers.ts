import { SettingDocument, SettingDto } from 'types/dist/settings';

const settingDocumentToDto = (setting: SettingDocument): SettingDto => {
  const { _id, key, value, valueRealized, type, label, description, group } =
    setting;

  return {
    _id,
    key,
    value,
    valueRealized,
    type,
    label,
    description,
    group,
  };
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
