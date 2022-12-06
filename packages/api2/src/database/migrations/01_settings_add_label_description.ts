import { model } from 'mongoose';
import { SettingSchema } from '../schemas/settings/01_settings.schema';

const settings = [
  {
    key: 'NAME',
    label: 'App Name',
    description: null,
  },
  {
    key: 'DESCRIPTION',
    label: 'App Description',
    description: null,
  },
  {
    key: 'PRAISE_QUANTIFIERS_PER_PRAISE_RECEIVER',
    label: 'Quantifiers Per Praise',
    description:
      'How many redundant quantifications are assigned to each praise?',
  },
  {
    key: 'PRAISE_PER_QUANTIFIER',
    label: 'Praise Per Quantifier',
    description: 'Roughly how much praise should each quantifier be assigned?',
  },
  {
    key: 'PRAISE_QUANTIFY_RECEIVER_PSEUDONYMS',
    label: 'Use Psuedonyms',
    description:
      'Should praise reciever names be obscured by a random psuedonym?',
  },
  {
    key: 'PRAISE_QUANTIFY_DUPLICATE_PRAISE_PERCENTAGE',
    label: 'Duplicate Praise Quantification Percentage',
    description:
      "How much of the original praise's value should its duplicate be valued as?",
  },
  {
    key: 'PRAISE_QUANTIFY_ALLOWED_VALUES',
    label: 'Quantification Values Options',
    description: 'List of allowed quantification values',
  },
  {
    key: 'PRAISE_GIVER_ROLE_ID',
    label: 'Praise Giver Discord Role',
    description: 'Discord Role ID authorized to dish praise',
  },
  {
    key: 'PRAISE_SUCCESS_MESSAGE',
    label: 'Praise Dished',
    description: 'Discord /praise command Response',
  },
  {
    key: 'PRAISE_ACCOUNT_NOT_ACTIVATED_ERROR',
    label: 'Account Not Activated',
    description: 'Discord /praise command Response',
  },
  {
    key: 'DM_ERROR',
    label: 'Command Run In DM',
    description: 'Discord /praise command Response',
  },
  {
    key: 'PRAISE_WITHOUT_PRAISE_GIVER_ROLE_ERROR',
    label: 'Unauthorized Giver',
    description: 'Discord /praise Command Response',
  },
  {
    key: 'PRAISE_INVALID_RECEIVERS_ERROR',
    label: 'Missing Receivers',
    description: 'Discord /praise Command Response',
  },
  {
    key: 'PRAISE_REASON_MISSING_ERROR',
    label: 'Missing Reason',
    description: 'Discord /praise Command Response',
  },
  {
    key: 'PRAISE_UNDEFINED_RECEIVERS_WARNING',
    label: 'Undefined Receivers',
    description: 'Discord /praise Command Response',
  },
  {
    key: 'PRAISE_TO_ROLE_WARNING',
    label: 'Unauthorized Recipient Role',
    description: 'Discord /praise Command Response',
  },
  {
    key: 'PRAISE_SUCCESS_DM',
    label: 'Recieved Praise',
    description: 'Discord Direct Message',
  },
  {
    key: 'PRAISE_ACCOUNT_NOT_ACTIVATED_ERROR_DM',
    label: 'Received Praise, but Account Not Activated',
    description: 'Discord Direct Message',
  },
  {
    key: 'LOGO',
    label: 'App Logo',
    description: null,
  },
];

const up = async (): Promise<void> => {
  const settingUpdates = settings.map((s) => ({
    updateOne: {
      filter: { key: s.key },
      update: { $set: { label: s.label, description: s.description } },
    },
  })) as any;

  const SettingModel = model('Setting', SettingSchema);
  await SettingModel.bulkWrite(settingUpdates);
};

const down = async (): Promise<void> => {
  const allKeys = settings.map((s) => s.key);
  const SettingModel = model('Setting', SettingSchema);
  await SettingModel.updateMany(
    { key: { $in: allKeys } },
    { $set: { label: undefined, description: undefined } },
  );
};

export { up, down };
