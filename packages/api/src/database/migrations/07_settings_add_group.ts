import { SettingGroup } from 'shared/dist/settings/types';
import { SettingsModel } from '../../settings/entities';

const overridableSettingKeys = [
  'PRAISE_QUANTIFIERS_PER_PRAISE_RECEIVER',
  'PRAISE_PER_QUANTIFIER',
  'PRAISE_QUANTIFY_RECEIVER_PSEUDONYMS',
  'PRAISE_QUANTIFY_DUPLICATE_PRAISE_PERCENTAGE',
  'PRAISE_QUANTIFY_ALLOWED_VALUES',
];

const settings = [
  {
    key: 'NAME',
    group: SettingGroup.APPLICATION,
  },
  {
    key: 'DESCRIPTION',
    group: SettingGroup.APPLICATION,
  },
  {
    key: 'LOGO',
    group: SettingGroup.APPLICATION,
  },
  {
    key: 'PRAISE_QUANTIFIERS_PER_PRAISE_RECEIVER',
    group: SettingGroup.PERIOD_DEFAULT,
  },
  {
    key: 'PRAISE_PER_QUANTIFIER',
    group: SettingGroup.PERIOD_DEFAULT,
  },
  {
    key: 'PRAISE_QUANTIFY_RECEIVER_PSEUDONYMS',
    group: SettingGroup.PERIOD_DEFAULT,
  },
  {
    key: 'PRAISE_QUANTIFY_DUPLICATE_PRAISE_PERCENTAGE',
    group: SettingGroup.PERIOD_DEFAULT,
  },
  {
    key: 'PRAISE_QUANTIFY_ALLOWED_VALUES',
    group: SettingGroup.PERIOD_DEFAULT,
  },
  {
    key: 'PRAISE_GIVER_ROLE_ID',
    group: SettingGroup.DISCORD,
  },
  {
    key: 'PRAISE_SUCCESS_MESSAGE',
    group: SettingGroup.DISCORD,
  },
  {
    key: 'PRAISE_ACCOUNT_NOT_ACTIVATED_ERROR',
    group: SettingGroup.DISCORD,
  },
  {
    key: 'DM_ERROR',
    group: SettingGroup.DISCORD,
  },
  {
    key: 'PRAISE_WITHOUT_PRAISE_GIVER_ROLE_ERROR',
    group: SettingGroup.DISCORD,
  },
  {
    key: 'PRAISE_INVALID_RECEIVERS_ERROR',
    group: SettingGroup.DISCORD,
  },
  {
    key: 'PRAISE_REASON_MISSING_ERROR',
    group: SettingGroup.DISCORD,
  },
  {
    key: 'PRAISE_UNDEFINED_RECEIVERS_WARNING',
    group: SettingGroup.DISCORD,
  },
  {
    key: 'PRAISE_TO_ROLE_WARNING',
    group: SettingGroup.DISCORD,
  },
  {
    key: 'PRAISE_SUCCESS_DM',
    group: SettingGroup.DISCORD,
  },
  {
    key: 'PRAISE_ACCOUNT_NOT_ACTIVATED_ERROR_DM',
    group: SettingGroup.DISCORD,
  },
  {
    key: 'PRAISE_ACCOUNT_ALREADY_ACTIVATED_ERROR',
    group: SettingGroup.DISCORD,
  },
  {
    key: 'FORWARD_FROM_USER_WITHOUT_PRAISE_GIVER_ROLE_ERROR',
    group: SettingGroup.DISCORD,
  },
  {
    key: 'FORWARD_FROM_UNACTIVATED_GIVER_ERROR',
    group: SettingGroup.DISCORD,
  },
  {
    key: 'FORWARD_SUCCESS_MESSAGE',
    group: SettingGroup.DISCORD,
  },
];

const up = async (): Promise<void> => {
  const settingUpdates = settings.map((s) => ({
    updateOne: {
      filter: { key: s.key },
      update: { $set: { group: s.group }, $unset: { periodOverridable: true } },
    },
  }));

  await SettingsModel.bulkWrite(settingUpdates);
};

const down = async (): Promise<void> => {
  const allKeys = settings.map((s) => s.key);
  await SettingsModel.updateMany(
    { key: { $in: allKeys } },
    { $unset: { group: 1 }, $set: { periodOverridable: false } }
  );

  await SettingsModel.updateMany(
    { key: { $in: overridableSettingKeys } },
    { $set: { periodOverridable: true } }
  );
};

export { up, down };
