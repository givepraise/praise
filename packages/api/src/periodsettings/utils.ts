import { SettingsModel } from '@settings/entities';
import { SettingDocument, SettingGroup } from 'shared/dist/settings/types';
import { PeriodDocument } from 'shared/dist/period/types';
import { PeriodSettingsModel } from './entities';
import { PeriodSetting } from 'shared/dist/periodsettings/types';

export const insertNewPeriodSettings = async (
  period: PeriodDocument
): Promise<void> => {
  let settings = await SettingsModel.find({
    group: SettingGroup.PERIOD_DEFAULT,
  });
  if (settings && !Array.isArray(settings)) settings = [settings];

  const newPeriodSettings = settings.map((setting: SettingDocument) => {
    const settingObj = setting.toObject() as SettingDocument;

    return {
      // copy original settings
      ...settingObj,

      // drop unused fields
      _id: undefined,
      __v: undefined,

      // set period
      period: period._id.toString(),
    } as PeriodSetting;
  });

  await PeriodSettingsModel.insertMany(newPeriodSettings);
};
