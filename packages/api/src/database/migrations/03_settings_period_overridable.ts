import { SettingsModel } from '../../settings/entities';
import { PeriodModel } from '../../period/entities';
import { PeriodSettingsModel } from '../../periodsettings/entities';
import { insertNewPeriodSettings } from '../../periodsettings/utils';

const up = async (): Promise<void> => {
  const overridableSettingKeys = [
    'PRAISE_QUANTIFIERS_PER_PRAISE_RECEIVER',
    'PRAISE_PER_QUANTIFIER',
    'PRAISE_QUANTIFY_RECEIVER_PSEUDONYMS',
    'PRAISE_QUANTIFY_DUPLICATE_PRAISE_PERCENTAGE',
    'PRAISE_QUANTIFY_ALLOWED_VALUES',
  ];

  // Update Settings Indexes to reflect new index of [key, period] defined in SettingsSchema
  await SettingsModel.syncIndexes();
  await PeriodSettingsModel.syncIndexes();

  // Specify which settings are overridable per-period
  await SettingsModel.updateMany(
    {
      key: {
        $in: overridableSettingKeys,
      },
    },
    { $set: { periodOverridable: true } }
  );

  await SettingsModel.updateMany(
    {
      key: {
        $nin: overridableSettingKeys,
      },
    },
    { $set: { periodOverridable: false } }
  );

  // Copy default settings for all existing periods
  const allPeriods = await PeriodModel.find();
  await Promise.all(allPeriods.map((p) => insertNewPeriodSettings(p)));
};

const down = async (): Promise<void> => {
  await SettingsModel.syncIndexes();
  await PeriodSettingsModel.syncIndexes();

  await SettingsModel.updateMany({}, { $unset: { periodOverridable: 1 } });

  await PeriodSettingsModel.deleteMany({});
};

export { up, down };
