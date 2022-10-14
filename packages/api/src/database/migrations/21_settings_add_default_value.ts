import { SettingsModel } from '../../settings/entities';

const settings = [
  {
    key: 'PRAISE_QUANTIFIERS_PER_PRAISE_RECEIVER',
    defaultValue: '4',
  },
  {
    key: 'PRAISE_PER_QUANTIFIER',
    defaultValue: '100',
  },
  {
    key: 'PRAISE_QUANTIFY_DUPLICATE_PRAISE_PERCENTAGE',
    defaultValue: '0,1',
  },
  {
    key: 'PRAISE_QUANTIFY_ALLOWED_VALUES',
    defaultValue: '0, 1, 3, 5, 8, 13, 21, 34, 55, 89, 144',
  },
  {
    key: 'PRAISE_GIVER_ROLE_ID',
    defaultValue: '0',
  },
  {
    key: 'PRAISE_SUCCESS_MESSAGE',
    defaultValue: '✅ Praise {@receivers} {reason}',
  },
  {
    key: 'PRAISE_ACCOUNT_NOT_ACTIVATED_ERROR',
    defaultValue:
      '**❌ Account Not Activated**\nYour account is not activated in the praise system. Unactivated accounts can not praise users. Use the `/activate` command to activate your praise account and to link your eth address.',
  },
  {
    key: 'DM_ERROR',
    defaultValue:
      '**❌ Server Not Found**\nThe praise command can only be used in the discord server.',
  },
  {
    key: 'PRAISE_WITHOUT_PRAISE_GIVER_ROLE_ERROR',
    defaultValue:
      '**❌ User does not have `{role}` role**\nThe praise command can only be used by members with the {@role} role. Attend an onboarding-call, or ask a steward or guide for an Intro to Praise.',
  },
  {
    key: 'PRAISE_INVALID_RECEIVERS_ERROR',
    defaultValue:
      '**❌ Receivers Not Mentioned**\nThis command requires at least one valid receiver to be mentioned, in order for praise to get dished.',
  },
  {
    key: 'PRAISE_REASON_MISSING_ERROR',
    defaultValue:
      '**❌ `reason` Not Provided**\nPraise can not be dished or quantified without a reason.',
  },
  {
    key: 'PRAISE_UNDEFINED_RECEIVERS_WARNING',
    defaultValue:
      "**⚠️  Undefined Receivers**\nCould not praise {@receivers}.\n{@user}, this warning could have been caused when a user isn't mentioned properly in the praise receivers field OR when a user isn't found in the discord server.",
  },
  {
    key: 'PRAISE_TO_ROLE_WARNING',
    defaultValue:
      "**⚠️  Roles as Praise receivers**\nCouldn't praise roles - {@receivers}.\n Praise does not support group/role based praising.",
  },
  {
    key: 'PRAISE_SUCCESS_DM',
    defaultValue:
      '**👏 Congratulations! You have been Praised! 👏**\n[View your praise in the TEC]({praiseURL})\n**Thank you** for supporting the Token Engineering Commons!',
  },
  {
    key: 'PRAISE_ACCOUNT_NOT_ACTIVATED_ERROR_DM',
    defaultValue:
      "**You were just [praised in the TEC](praiseURL)**\nIt looks like you haven't activated your account...\nTo activate your account, use the `/activate` command in the server.",
  },
  {
    key: 'FORWARD_SUCCESS_MESSAGE',
    defaultValue: '✅ Forward praise from {@giver} to {@receivers} {reason}',
  },
  {
    key: 'FORWARD_FROM_UNACTIVATED_GIVER_ERROR',
    defaultValue:
      "**❌ praiseGiver Account Not Activated**\n{@giver}'s account is not activated in the praise system. Unactivated accounts can not praise users. The praiseGiver would have to use the `/activate` command to activate their praise account and to link their eth address.",
  },
  {
    key: 'FORWARD_FROM_USER_WITHOUT_PRAISE_GIVER_ROLE_ERROR',
    defaultValue:
      '**❌ praiseGiver does not have `{role}` role**\nPraise can only be dished by or forwarded from members with the {@role} role. Contact the praiseGiver {@giver}, so that they can attend an onboarding-call, or ask a steward or guide for an Intro to Praise.',
  },
  {
    key: 'PRAISE_ACCOUNT_ALREADY_ACTIVATED_ERROR',
    defaultValue:
      '**❌ Account Already Activated**\nYour account is already activated in the praise system.',
  },
  {
    key: 'SELF_PRAISE_WARNING',
    defaultValue:
      '**⚠️  Self Praise Not Allowed**\nPraise givers can not praise themselves.',
  },
  {
    key: 'FIRST_TIME_PRAISER',
    defaultValue:
      '**🎉 Welcome first time praiser! **\nNow that you have sent your first praise, learn more about how to write excellent praise: https://givepraise.xyz/docs/writing-excellent-praise',
  },
  {
    key: 'PRAISE_ALLOWED_CHANNEL_IDS',
    defaultValue: null,
  },
  {
    key: 'CUSTOM_EXPORT_MAP',
    defaultValue:
      'https://raw.githubusercontent.com/commons-stack/praise-export-transformers/main/aragon-fixed-budget/transformer.json',
  },
  {
    key: 'CUSTOM_EXPORT_CONTEXT',
    defaultValue: '{ "budget": 100, "token": "TOKEN_NAME" }',
  },
  {
    key: 'CS_SUPPORT_PERCENTAGE',
    defaultValue: '2',
  },
];

const up = async (): Promise<void> => {
  const settingUpdates = settings.map((s) => ({
    updateOne: {
      filter: { key: s.key },
      update: { $set: { defaultValue: s.defaultValue } },
    },
  }));

  await SettingsModel.bulkWrite(settingUpdates);
};

const down = async (): Promise<void> => {
  const allKeys = settings.map((s) => s.key);
  await SettingsModel.updateMany(
    { key: { $in: allKeys } },
    { $set: { defaultValue: undefined } }
  );
};

export { up, down };
