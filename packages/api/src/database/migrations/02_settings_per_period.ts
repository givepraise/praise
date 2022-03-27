import { SettingsModel } from '../../settings/entities';
import { PeriodModel } from '../../period/entities';
import { insertNewPeriodSettings } from '../../period/utils';

const up = async (): Promise<void> => {
  // Define all existing settings as 'global'
  //  some as overridable per-period
  const overridableSettingKeys = [
    'PRAISE_QUANTIFIERS_PER_PRAISE_RECEIVER',
    'PRAISE_PER_QUANTIFIER',
    'PRAISE_QUANTIFY_RECEIVER_PSEUDONYMS',
    'PRAISE_QUANTIFY_DUPLICATE_PRAISE_PERCENTAGE',
    'PRAISE_QUANTIFY_ALLOWED_VALUES',
  ];

  await SettingsModel.updateMany(
    {
      key: {
        $in: overridableSettingKeys,
      },
    },
    { $set: { periodOverridable: true, period: undefined } }
  );

  await SettingsModel.updateMany(
    {
      key: {
        $nin: overridableSettingKeys,
      },
    },
    { $set: { periodOverridable: false, period: undefined } }
  );

  // Copy default settings for all existing periods
  const allPeriods = await PeriodModel.find();
  await Promise.all(allPeriods.map((p) => insertNewPeriodSettings(p)));
};

const down = async (): Promise<void> => {
  await SettingsModel.updateMany({}, { $unset: { periodOverridable: 1 } });

  await SettingsModel.deleteMany({ $isset: { period: 1 } });
};

export { up, down };
