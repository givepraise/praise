import { SettingDocument, SettingDto } from './types';

/**
 * Serialize a Setting
 *
 * @param {SettingDocument} setting
 * @returns {SettingDto}
 */
export const settingTransformer = (setting: SettingDocument): SettingDto => {
  const { _id, key, type, label, description, group, options, section } =
    setting;
  let { value, valueRealized } = setting;
  if (type === 'JSON' && value) {
    value = JSON.stringify(JSON.parse(value), null, 2);
    valueRealized = JSON.stringify(JSON.parse(value), null, 2);
  }
  return {
    _id,
    key,
    value,
    valueRealized,
    type,
    label,
    description,
    group,
    options,
    section,
  };
};

/**
 * Serialize a list of Settings
 *
 * @param {(SettingDocument[] | undefined)} settings
 * @returns {SettingDto[]}
 */
export const settingListTransformer = (
  settings: SettingDocument[] | undefined
): SettingDto[] => {
  if (settings && Array.isArray(settings)) {
    return settings.map((setting) => settingTransformer(setting));
  }
  return [];
};
