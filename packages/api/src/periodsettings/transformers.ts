import { PeriodSettingDocument, PeriodSettingDto } from './types';

export const periodsettingTransformer = (
  setting: PeriodSettingDocument
): PeriodSettingDto => {
  const { _id, key, value, valueRealized, type, label, description, period } =
    setting;
  return { _id, key, value, valueRealized, type, label, description, period };
};

export const periodsettingListTransformer = (
  settings: PeriodSettingDocument[] | undefined
): PeriodSettingDto[] => {
  if (!settings) return [];

  return settings.map((setting) => periodsettingTransformer(setting));
};
