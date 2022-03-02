import { SettingsModel } from '@settings/entities';

const settings = [
  { key: 'NAME', value: process.env.NAME, type: 'String' },
  { key: 'DESCRIPTION', value: process.env.DESCRIPTION, type: 'Textarea' },
  {
    key: 'PRAISE_QUANTIFIERS_PER_PRAISE_RECEIVER',
    value: process.env.PRAISE_QUANTIFIERS_PER_PRAISE_RECEIVER || 3,
    type: 'Number',
  },
  {
    key: 'PRAISE_PER_QUANTIFIER',
    value: process.env.PRAISE_PER_QUANTIFIER || 50,
    type: 'Number',
  },
  {
    key: 'PRAISE_QUANTIFY_RECEIVER_PSEUDONYMS',
    value: process.env.PRAISE_QUANTIFY_RECEIVER_PSEUDONYMS || false,
    type: 'Boolean',
  },
  {
    key: 'PRAISE_QUANTIFY_DUPLICATE_PRAISE_PERCENTAGE',
    value: process.env.PRAISE_QUANTIFY_DUPLICATE_PRAISE_PERCENTAGE || 0.1,
    type: 'Number',
  },
  {
    key: 'PRAISE_QUANTIFY_ALLOWED_VALUES',
    value:
      process.env.PRAISE_QUANTIFY_ALLOWED_VALUES ||
      '0, 1, 3, 5, 8, 13, 21, 34, 55, 89, 144',
    type: 'List',
  },
  {
    key: 'PRAISE_GIVER_ROLE_ID',
    value: process.env.PRAISE_GIVER_ROLE_ID || '0',
    type: 'String',
  },
  {
    key: 'PRAISE_SUCCESS_MESSAGE',
    value:
      process.env.PRAISE_SUCCESS_MESSAGE ||
      '✅ Praise {praiseReceivers} {reason}',
    type: 'Textarea',
  },
  {
    key: 'PRAISE_ACCOUNT_NOT_ACTIVATED_ERROR',
    value:
      process.env.PRAISE_NOT_ACTIVATED_ERROR ||
      '**❌ Account Not Activated**\nYour account is not activated in the praise system. Unactivated accounts can not praise users. Use the `/praise-activate` command to activate your praise account and to link your eth address.',
    type: 'Textarea',
  },
  {
    key: 'DM_ERROR',
    value:
      process.env.DM_ERROR ||
      '**❌ Server Not Found**\nThe praise command can only be used in the discord server.',
    type: 'Textarea',
  },
  {
    key: 'PRAISE_WITHOUT_PRAISE_GIVER_ROLE_ERROR',
    value:
      '**❌ User does not have `{role}`**\nThe praise command can only be used by members with the {@role} role. Attend an onboarding-call, or ask a steward or guide for an Intro to Praise.',
    type: 'Textarea',
  },
  {
    key: 'PRAISE_INVALID_RECEIVERS_ERROR',
    value:
      '**❌ Receivers Not Mentioned**\nThis command requires atleast one valid receiver to be mentioned, in order for praise to get dished.',
    type: 'Textarea',
  },
  {
    key: 'PRAISE_REASON_MISSING_ERROR',
    value:
      '**❌ `reason` Not Provided**\nPraise can not be dished or quantified without a reason.',
    text: 'Textarea',
  },
];

const seedSettings = async (): Promise<void> => {
  for (const s of settings) {
    const document = await SettingsModel.findOne({ key: s.key });
    if (!document && s.value) {
      await SettingsModel.create(s);
    }
  }
};

export { seedSettings };
