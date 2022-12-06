import { SettingGroup } from '@/settings/interfaces/settings-group.interface';
import { model } from 'mongoose';
import { PeriodSchema } from '../schemas/period/period.schema';
import { PeriodSettingsSchema } from '../schemas/periodsettings/periodsettings.schema';
import { SettingSchema } from '../schemas/settings/01_settings.schema';

const insertNewPeriodSettings = async (period: any): Promise<void> => {
  const SettingModel = model('Setting', SettingSchema);

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

  const PeriodSettingsModel = model('PeriodSettings', PeriodSettingsSchema);
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

  const SettingModel = model('Setting', SettingSchema);
  const PeriodModel = model('Period', PeriodSchema);
  const PeriodSettingsModel = model('PeriodSettings', PeriodSettingsSchema);

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
  const allPeriods = await PeriodModel.find();
  await Promise.all(allPeriods.map((p) => insertNewPeriodSettings(p)));
};

const down = async (): Promise<void> => {
  const SettingModel = model('Setting', SettingSchema);
  const PeriodSettingsModel = model('PeriodSettings', PeriodSettingsSchema);

  await SettingModel.syncIndexes();
  await PeriodSettingsModel.syncIndexes();

  await SettingModel.updateMany({}, { $unset: { periodOverridable: 1 } });

  await PeriodSettingsModel.deleteMany({});
};

export { up, down };
