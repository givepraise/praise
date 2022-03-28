import { SettingsModel } from '@settings/entities';
import mongoose from 'mongoose';

export const settingValue = async (
  key: string,
  periodId: mongoose.Schema.Types.ObjectId | undefined = undefined
): Promise<string | null> => {
  const setting = await SettingsModel.findOne({
    key,
    periodId,
  });
  if (setting) return setting.value;
  return null;
};

export const settingInt = async (
  key: string,
  periodId: mongoose.Schema.Types.ObjectId | undefined = undefined
): Promise<number | null> => {
  const value = await settingValue(key, periodId);
  if (value) {
    const int = parseInt(value);
    if (!isNaN(int)) return int;
  }
  return null;
};

export const settingFloat = async (
  key: string,
  periodId: mongoose.Schema.Types.ObjectId | undefined = undefined
): Promise<number | null> => {
  const value = await settingValue(key, periodId);
  if (value) {
    const float = parseFloat(value);
    if (!isNaN(float)) return float;
  }
  return null;
};
