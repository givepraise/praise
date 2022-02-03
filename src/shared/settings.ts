import { SettingsModel } from '@settings/entities';

export const settingValue = async (key: string): Promise<string | null> => {
  const setting = await SettingsModel.findOne({ key });
  if (setting) return setting.value;
  return null;
};

export const settingInt = async (key: string): Promise<number | null> => {
  const value = await settingValue(key);
  if (value) {
    const int = parseInt(value);
    if (!isNaN(int)) return int;
  }
  return null;
};

export const settingFloat = async (key: string): Promise<number | null> => {
  const value = await settingValue(key);
  if (value) {
    const float = parseFloat(value);
    if (!isNaN(float)) return float;
  }
  return null;
};
