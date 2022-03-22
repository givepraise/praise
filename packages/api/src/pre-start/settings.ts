import { SettingsModel } from '@settings/entities';

const settings = [
  {
    key: 'NAME',
    value: process.env.NAME,
    type: 'String',
    label: 'App Name',
    description: null,
  },
  {
    key: 'DESCRIPTION',
    value: process.env.DESCRIPTION,
    type: 'Textarea',
    label: 'App Description',
    description: null,
  },
  {
    key: 'PRAISE_QUANTIFIERS_PER_PRAISE_RECEIVER',
    value: process.env.PRAISE_QUANTIFIERS_PER_PRAISE_RECEIVER || 3,
    type: 'Number',
    label: 'Quantifiers Per Praise',
    description:
      'How many *redundant* quantifications are assigned to each praise?',
  },
  {
    key: 'PRAISE_PER_QUANTIFIER',
    value: process.env.PRAISE_PER_QUANTIFIER || 50,
    type: 'Number',
    label: 'Praise Per Quantifier',
    description: 'Roughly how much praise should each quantifier be assigned?',
  },
  {
    key: 'PRAISE_QUANTIFY_RECEIVER_PSEUDONYMS',
    value: process.env.PRAISE_QUANTIFY_RECEIVER_PSEUDONYMS || false,
    type: 'Boolean',
    label: 'Use Psuedonyms',
    description: 'Obscure the names of praise recievers with pseudonyms?',
  },
  {
    key: 'PRAISE_QUANTIFY_DUPLICATE_PRAISE_PERCENTAGE',
    value: process.env.PRAISE_QUANTIFY_DUPLICATE_PRAISE_PERCENTAGE || 0.1,
    type: 'Number',
    label: 'Duplicate Praise Quantification Percentage',
    description:
      "How much of the original praise's value should its duplicate be valued as?",
  },
  {
    key: 'PRAISE_QUANTIFY_ALLOWED_VALUES',
    value:
      process.env.PRAISE_QUANTIFY_ALLOWED_VALUES ||
      '0, 1, 3, 5, 8, 13, 21, 34, 55, 89, 144',
    type: 'List',
    label: 'Quantify Allowed Values',
    description: 'List of all possible quantification values',
  },
  {
    key: 'PRAISE_GIVER_ROLE_ID',
    value: process.env.PRAISE_GIVER_ROLE_ID || '0',
    type: 'String',
    label: 'Discord: Praise Giver Role ID',
    description: 'Discord Role ID allowed to dish praise',
  },
  {
    key: 'PRAISE_SUCCESS_MESSAGE',
    value: '✅ Praise {receivers} {reason}',
    type: 'Textarea',
    label: 'Praise Dished',
    description: 'Discord Success Response',
  },
  {
    key: 'PRAISE_ACCOUNT_NOT_ACTIVATED_ERROR',
    value:
      '**❌ Account Not Activated**\nYour account is not activated in the praise system. Unactivated accounts can not praise users. Use the `/praise-activate` command to activate your praise account and to link your eth address.',
    type: 'Textarea',
    label: 'Account Not Activated',
    description: 'Discord Error Response',
  },
  {
    key: 'DM_ERROR',
    value:
      '**❌ Server Not Found**\nThe praise command can only be used in the discord server.',
    type: 'Textarea',
    label: 'Command Run In DM',
    description: 'Discord Error Response',
  },
  {
    key: 'PRAISE_WITHOUT_PRAISE_GIVER_ROLE_ERROR',
    value:
      '**❌ User does not have `{role}` role**\nThe praise command can only be used by members with the {@role} role. Attend an onboarding-call, or ask a steward or guide for an Intro to Praise.',
    type: 'Textarea',
    label: 'Unauthorized Giver Role',
    description: 'Discord Error Response',
  },
  {
    key: 'PRAISE_INVALID_RECEIVERS_ERROR',
    value:
      '**❌ Receivers Not Mentioned**\nThis command requires atleast one valid receiver to be mentioned, in order for praise to get dished.',
    type: 'Textarea',
    label: 'Invalid Receivers',
    description: 'Discord Error Response',
  },
  {
    key: 'PRAISE_REASON_MISSING_ERROR',
    value:
      '**❌ `reason` Not Provided**\nPraise can not be dished or quantified without a reason.',
    type: 'Textarea',
    label: 'Missing Reason',
    description: 'Discord Error Response',
  },
  {
    key: 'PRAISE_UNDEFINED_RECEIVERS_WARNING',
    value:
      "**⚠️  Undefined Receivers**\nCould not praise {@receivers}.\n{@user}, this warning could have been caused when a user isn't mentioned properly in the praise receivers field OR when a user isn't found in the discord server.",
    type: 'Textarea',
    label: 'Undefined Receivers',
    description: 'Discord Error Response',
  },
  {
    key: 'PRAISE_TO_ROLE_WARNING',
    value:
      "**⚠️  Roles as Praise receivers**\nCouldn't praise roles - {@receivers}.\n {@user}, use the `/group-praise` for distribution of praise to all the members that have certain discord roles.",
    type: 'Textarea',
    label: 'Unauthorized Recipient Role',
    description: 'Discord Error Response',
  },
  {
    key: 'PRAISE_SUCCESS_DM',
    value:
      '**👏 Congratulations! You have been Praised! 👏**\n[View your praise in the TEC]({praiseURL})\n**Thank you** for supporting the Token Engineering Commons!',
    type: 'Textarea',
    label: 'Recieved Praise',
    description: 'Discord Error Response',
  },
  {
    key: 'PRAISE_ACCOUNT_NOT_ACTIVATED_ERROR_DM',
    value:
      "**You were just [praised in the TEC](praiseURL)\nIt looks like you haven't activated your account...To activate your account, use the `/praise-activate` command in the server.",
    type: 'Textarea',
    label: 'Received Praise, but Account Not Activated',
    description: 'Discord Error Response',
  },
  {
    key: 'LOGO',
    value: '/upload/logo.png',
    type: 'Image',
    label: 'App Logo',
    description: null,
  },
];

const seedSettings = async (): Promise<void> => {
  for (const defaultSetting of settings) {
    const setting = await SettingsModel.findOne({ key: defaultSetting.key });
    if (!setting) {
      await SettingsModel.create(defaultSetting);
    }
  }
};

export { seedSettings };
