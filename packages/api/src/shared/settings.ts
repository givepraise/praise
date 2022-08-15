import { Types } from 'mongoose';
import { SettingsModel } from '@/settings/entities';
import { PeriodSettingsModel } from '@/periodsettings/entities';

export const settingValue = async (
  key: string,
  periodId: Types.ObjectId | undefined = undefined
): Promise<string | boolean | number | number[] | string[]> => {
  let setting;
  if (!periodId) {
    setting = await SettingsModel.findOne({
      key,
    });

    if (!setting) {
      throw Error(`Setting ${key} does not exist`);
    }
  } else {
    setting = await PeriodSettingsModel.findOne({
      key,
      period: periodId,
    });
    if (!setting) {
      const periodString = periodId
        ? `period ${periodId.toString()}`
        : 'global';
      throw Error(`periodsetting ${key} does not exist for ${periodString}`);
    }
  }

  return setting.valueRealized;
};
