import { SettingsModel } from '@settings/entities';
import mongoose from 'mongoose';

export const settingValue = async (
  key: string,
  periodId: mongoose.Schema.Types.ObjectId | undefined = undefined
): Promise<string | boolean | number | number[]> => {
  const setting = await SettingsModel.findOne({
    key,
    period: periodId,
  });
  if (!setting) throw Error(`Setting ${key} does not exist`);

  return setting.valueNormalized;
};
