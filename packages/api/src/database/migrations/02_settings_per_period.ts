import { SettingsModel } from '../../settings/entities';

const overridableSettingKeys = [
  'PRAISE_QUANTIFIERS_PER_PRAISE_RECEIVER',
  'PRAISE_PER_QUANTIFIER',
  'PRAISE_QUANTIFY_RECEIVER_PSEUDONYMS',
  'PRAISE_QUANTIFY_DUPLICATE_PRAISE_PERCENTAGE',
  'PRAISE_QUANTIFY_ALLOWED_VALUES',
];

const up = async (): Promise<void> => {
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
};

const down = async (): Promise<void> => {
  await SettingsModel.updateMany({}, { $unset: { periodOverridable: 1 } });
};

export { up, down };
