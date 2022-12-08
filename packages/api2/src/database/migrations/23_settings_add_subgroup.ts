import { Setting } from '@/settings/schemas/settings.schema';
import { model } from 'mongoose';
import { SettingSchema } from '../schemas/settings/21_settings.schema';

const settings = [
  {
    key: 'NAME',
    subgroup: 1,
  },
  {
    key: 'DESCRIPTION',
    subgroup: 1,
  },
  {
    key: 'LOGO',
    subgroup: 1,
  },
  {
    key: 'PRAISE_QUANTIFIERS_PER_PRAISE_RECEIVER',
    subgroup: 1,
  },
  {
    key: 'PRAISE_PER_QUANTIFIER',
    subgroup: 1,
  },
  {
    key: 'PRAISE_QUANTIFY_RECEIVER_PSEUDONYMS',
    subgroup: 1,
  },
  {
    key: 'PRAISE_QUANTIFY_DUPLICATE_PRAISE_PERCENTAGE',
    subgroup: 1,
  },
  {
    key: 'PRAISE_QUANTIFY_ALLOWED_VALUES',
    subgroup: 1,
  },
  {
    key: 'PRAISE_ALLOWED_IN_ALL_CHANNELS',
    subgroup: 1,
  },
  {
    key: 'PRAISE_ALLOWED_CHANNEL_IDS',
    subgroup: 1,
  },
  {
    key: 'SELF_PRAISE_ALLOWED',
    subgroup: 1,
  },
  {
    key: 'PRAISE_GIVER_ROLE_ID_REQUIRED',
    subgroup: 1,
  },
  {
    key: 'PRAISE_GIVER_ROLE_ID',
    subgroup: 1,
  },
  {
    key: 'PRAISE_ACCOUNT_NOT_ACTIVATED_ERROR',
    subgroup: 2,
  },
  {
    key: 'PRAISE_WITHOUT_PRAISE_GIVER_ROLE_ERROR',
    subgroup: 2,
  },
  {
    key: 'PRAISE_ACCOUNT_ALREADY_ACTIVATED_ERROR',
    subgroup: 2,
  },
  {
    key: 'FORWARD_FROM_UNACTIVATED_GIVER_ERROR',
    subgroup: 2,
  },
  {
    key: 'FORWARD_FROM_USER_WITHOUT_PRAISE_GIVER_ROLE_ERROR',
    subgroup: 2,
  },
  {
    key: 'PRAISE_SUCCESS_MESSAGE',
    subgroup: 3,
  },
  {
    key: 'FIRST_TIME_PRAISER',
    subgroup: 3,
  },
  {
    key: 'DM_ERROR',
    subgroup: 3,
  },
  {
    key: 'PRAISE_INVALID_RECEIVERS_ERROR',
    subgroup: 3,
  },
  {
    key: 'PRAISE_UNDEFINED_RECEIVERS_WARNING',
    subgroup: 3,
  },
  {
    key: 'PRAISE_TO_ROLE_WARNING',
    subgroup: 3,
  },
  {
    key: 'PRAISE_REASON_MISSING_ERROR',
    subgroup: 3,
  },
  {
    key: 'PRAISE_SUCCESS_DM',
    subgroup: 3,
  },
  {
    key: 'PRAISE_ACCOUNT_NOT_ACTIVATED_ERROR_DM',
    subgroup: 3,
  },
  {
    key: 'SELF_PRAISE_WARNING',
    subgroup: 3,
  },
  {
    key: 'FORWARD_SUCCESS_MESSAGE',
    subgroup: 3,
  },
  {
    key: 'PRAISE_QUANTIFIERS_ASSIGN_EVENLY',
    subgroup: 1,
  },
  {
    key: 'CUSTOM_EXPORT_MAP',
    subgroup: 1,
  },
  {
    key: 'CUSTOM_EXPORT_CONTEXT',
    subgroup: 1,
  },
  {
    key: 'CS_SUPPORT_PERCENTAGE',
    subgroup: 1,
  },
  {
    key: 'CUSTOM_EXPORT_CSV_FORMAT',
    subgroup: 1,
  },
];

const up = async (): Promise<void> => {
  const settingUpdates = settings.map((s) => ({
    updateOne: {
      filter: { key: s.key },
      update: { $set: { subgroup: s.subgroup } },
    },
  }));

  const SettingModel = model<Setting>('Setting', SettingSchema);
  await SettingModel.bulkWrite(settingUpdates);
};

const down = async (): Promise<void> => {
  const SettingModel = model<Setting>('Setting', SettingSchema);
  const allKeys = settings.map((s) => s.key);
  await SettingModel.updateMany(
    { key: { $in: allKeys } },
    { $set: { subgroup: undefined } },
  );
};

export { up, down };
