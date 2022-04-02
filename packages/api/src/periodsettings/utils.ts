import { SettingsModel } from '@settings/entities';
import { SettingDocument } from '@settings/types';
import { PeriodDocument } from '@period/types';
import { PeriodSettingsModel } from './entities';
import { PeriodSetting } from './types';

export const insertNewPeriodSettings = async (
  period: PeriodDocument
): Promise<void> => {
  let settings = await SettingsModel.find({
    periodOverridable: true,
  });
  if (settings && !Array.isArray(settings)) settings = [settings];

  const newPeriodSettings = settings.map((setting: SettingDocument) => {
    const settingObj = setting.toObject();

    return {
      // copy original settings
      ...settingObj,

      // drop unused fields
      _id: undefined,
      __v: undefined,
      periodOverridable: undefined,

      // set period
      period: period._id,
    } as PeriodSetting;
  });

  await PeriodSettingsModel.insertMany(newPeriodSettings);
};
