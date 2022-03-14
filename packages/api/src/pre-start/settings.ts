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
    value: '✅ Praise {receivers} {reason}',
    type: 'Textarea',
  },
  {
    key: 'PRAISE_ACCOUNT_NOT_ACTIVATED_ERROR',
    value:
      '**❌ Account Not Activated**\nYour account is not activated in the praise system. Unactivated accounts can not praise users. Use the `/praise-activate` command to activate your praise account and to link your eth address.',
    type: 'Textarea',
  },
  {
    key: 'DM_ERROR',
    value:
      '**❌ Server Not Found**\nThe praise command can only be used in the discord server.',
    type: 'Textarea',
  },
  {
    key: 'PRAISE_WITHOUT_PRAISE_GIVER_ROLE_ERROR',
    value:
      '**❌ User does not have `{role}` role**\nThe praise command can only be used by members with the {@role} role. Attend an onboarding-call, or ask a steward or guide for an Intro to Praise.',
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
    type: 'Textarea',
  },
  {
    key: 'PRAISE_UNDEFINED_RECEIVERS_WARNING',
    value:
      "**⚠️  Undefined Receivers**\nCould not praise {@receivers}.\n{@user}, this warning could have been caused when a user isn't mentioned properly in the praise receivers field OR when a user isn't found in the discord server.",
    type: 'Textarea',
  },
  {
    key: 'PRAISE_TO_ROLE_WARNING',
    value:
      "**⚠️  Roles as Praise receivers**\nCouldn't praise roles - {@receivers}.\n {@user}, use the `/group-praise` for distribution of praise to all the members that have certain discord roles.",
    type: 'Textarea',
  },
  {
    key: 'PRAISE_SUCCESS_DM',
    value:
      '**👏 Congratulations! You have been Praised! 👏**\n[View your praise in the TEC]({praiseURL})\n**Thank you** for supporting the Token Engineering Commons!',
    type: 'Textarea',
  },
  {
    key: 'PRAISE_ACCOUNT_NOT_ACTIVATED_ERROR_DM',
    value:
      "**You were just [praised in the TEC](praiseURL)\nIt looks like you haven't activated your account...To activate your account, use the `/praise-activate` command in the server.",
    type: 'Textarea',
  },
  {
    key: 'LOGO',
    value: '',
    type: 'Image',
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
