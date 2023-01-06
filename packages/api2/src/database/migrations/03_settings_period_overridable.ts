import { SettingGroup } from '../../settings/interfaces/settings-group.interface';
import { PeriodModel } from '../schemas/period/period.schema';
import { PeriodSettingsModel } from '../schemas/periodsettings/01_periodsettings.schema';
import { SettingModel } from '../schemas/settings/01_settings.schema';

const insertNewPeriodSettings = async (period: any): Promise<void> => {
  let settings = await SettingModel.find({
    group: SettingGroup.PERIOD_DEFAULT,
  });
  if (settings && !Array.isArray(settings)) settings = [settings];

  const newPeriodSettings = settings.map((setting: any) => {
    const settingObj = setting.toObject() as any;

    return {
      // copy original settings
      ...settingObj,

      // drop unused fields
      _id: undefined,
      __v: undefined,

      // set period
      period: period._id.toString(),
    } as any;
  });

  await PeriodSettingsModel.insertMany(newPeriodSettings);
};

const up = async (): Promise<void> => {
  const overridableSettingKeys = [
    'PRAISE_QUANTIFIERS_PER_PRAISE_RECEIVER',
    'PRAISE_PER_QUANTIFIER',
    'PRAISE_QUANTIFY_RECEIVER_PSEUDONYMS',
    'PRAISE_QUANTIFY_DUPLICATE_PRAISE_PERCENTAGE',
    'PRAISE_QUANTIFY_ALLOWED_VALUES',
  ];

  // Update Settings Indexes to reflect new index of [key, period] defined in SettingsSchema
  await SettingModel.syncIndexes();
  await PeriodSettingsModel.syncIndexes();

  // Specify which settings are overridable per-period
  await SettingModel.updateMany(
    {
      key: {
        $in: overridableSettingKeys,
      },
    },
    { $set: { periodOverridable: true } },
  );

  await SettingModel.updateMany(
    {
      key: {
        $nin: overridableSettingKeys,
      },
    },
    { $set: { periodOverridable: false } },
  );

  // Copy default settings for all existing periods
  // const allPeriods = await PeriodModel.find();
  // await Promise.all(allPeriods.map((p) => insertNewPeriodSettings(p)));
};

const down = async (): Promise<void> => {
  // await SettingModel.syncIndexes();
  // await PeriodSettingsModel.syncIndexes();
  // await SettingModel.updateMany({}, { $unset: { periodOverridable: 1 } });
  // await PeriodSettingsModel.deleteMany({});
};

export { up, down };
