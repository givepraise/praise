import { PeriodSettingDocument, PeriodSettingDto } from './types';

/**
 * Serialize a PeriodSetting
 *
 * @param {PeriodSettingDocument} setting
 * @returns {PeriodSettingDto}
 */
export const periodSettingTransformer = (
  setting: PeriodSettingDocument
): PeriodSettingDto => {
  const { _id, key, value, valueRealized, type, label, description, period } =
    setting;
  return { _id, key, value, valueRealized, type, label, description, period };
};

/**
 * Serialize a list of PeriodSettings
 *
 * @param {(PeriodSettingDocument[] | undefined)} settings
 * @returns {PeriodSettingDto[]}
 */
export const periodsettingListTransformer = (
  settings: PeriodSettingDocument[] | undefined
): PeriodSettingDto[] => {
  if (!settings) return [];

  return settings.map((setting) => periodSettingTransformer(setting));
};
