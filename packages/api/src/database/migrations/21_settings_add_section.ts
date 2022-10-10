import { SettingsModel } from '../../settings/entities';

const settings = [
  {
    key: 'NAME',
    section: 1,
  },
  {
    key: 'DESCRIPTION',
    section: 1,
  },
  {
    key: 'LOGO',
    section: 1,
  },
  {
    key: 'PRAISE_QUANTIFIERS_PER_PRAISE_RECEIVER',
    section: 1,
  },
  {
    key: 'PRAISE_PER_QUANTIFIER',
    section: 1,
  },
  {
    key: 'PRAISE_QUANTIFY_RECEIVER_PSEUDONYMS',
    section: 1,
  },
  {
    key: 'PRAISE_QUANTIFY_DUPLICATE_PRAISE_PERCENTAGE',
    section: 1,
  },
  {
    key: 'PRAISE_QUANTIFY_ALLOWED_VALUES',
    section: 1,
  },
  {
    key: 'PRAISE_ALLOWED_IN_ALL_CHANNELS',
    section: 1,
  },
  {
    key: 'PRAISE_ALLOWED_CHANNEL_IDS',
    section: 1,
  },
  {
    key: 'SELF_PRAISE_ALLOWED',
    section: 1,
  },
  {
    key: 'PRAISE_GIVER_ROLE_ID_REQUIRED',
    section: 1,
  },
  {
    key: 'PRAISE_GIVER_ROLE_ID',
    section: 1,
  },
  {
    key: 'PRAISE_ACCOUNT_NOT_ACTIVATED_ERROR',
    section: 2,
  },
  {
    key: 'PRAISE_WITHOUT_PRAISE_GIVER_ROLE_ERROR',
    section: 2,
  },
  {
    key: 'PRAISE_ACCOUNT_ALREADY_ACTIVATED_ERROR',
    section: 2,
  },
  {
    key: 'FORWARD_FROM_UNACTIVATED_GIVER_ERROR',
    section: 2,
  },
  {
    key: 'FORWARD_FROM_USER_WITHOUT_PRAISE_GIVER_ROLE_ERROR',
    section: 2,
  },
  {
    key: 'PRAISE_SUCCESS_MESSAGE',
    section: 3,
  },
  {
    key: 'FIRST_TIME_PRAISER',
    section: 3,
  },
  {
    key: 'DM_ERROR',
    section: 3,
  },
  {
    key: 'PRAISE_INVALID_RECEIVERS_ERROR',
    section: 3,
  },
  {
    key: 'PRAISE_UNDEFINED_RECEIVERS_WARNING',
    section: 3,
  },
  {
    key: 'PRAISE_TO_ROLE_WARNING',
    section: 3,
  },
  {
    key: 'PRAISE_REASON_MISSING_ERROR',
    section: 3,
  },
  {
    key: 'PRAISE_SUCCESS_DM',
    section: 3,
  },
  {
    key: 'PRAISE_ACCOUNT_NOT_ACTIVATED_ERROR_DM',
    section: 3,
  },
  {
    key: 'SELF_PRAISE_WARNING',
    section: 3,
  },
  {
    key: 'FORWARD_SUCCESS_MESSAGE',
    section: 3,
  },
  {
    key: 'PRAISE_QUANTIFIERS_ASSIGN_EVENLY',
    section: 1,
  },
  {
    key: 'CUSTOM_EXPORT_MAP',
    section: 1,
  },
  {
    key: 'CUSTOM_EXPORT_CONTEXT',
    section: 1,
  },
  {
    key: 'CS_SUPPORT_PERCENTAGE',
    section: 1,
  },
  {
    key: 'CUSTOM_EXPORT_CSV_FORMAT',
    section: 1,
  },
];

const up = async (): Promise<void> => {
  const settingUpdates = settings.map((s) => ({
    updateOne: {
      filter: { key: s.key },
      update: { $set: { section: s.section } },
    },
  }));

  await SettingsModel.bulkWrite(settingUpdates);
};

const down = async (): Promise<void> => {
  const allKeys = settings.map((s) => s.key);
  await SettingsModel.updateMany(
    { key: { $in: allKeys } },
    { $set: { section: undefined } }
  );
};

export { up, down };
