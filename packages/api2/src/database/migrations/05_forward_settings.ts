import { SettingModel } from '../schemas/settings/03_settings.schema';

const settings = [
  {
    key: 'FORWARD_SUCCESS_MESSAGE',
    value: '✅ Forward praise from {@giver} to {@receivers} {reason}',
    type: 'Textarea',
    label: 'Praise Forwarded',
    description: 'Discord /forward command response',
  },
  {
    key: 'FORWARD_FROM_UNACTIVATED_GIVER_ERROR',
    value:
      "**❌ praiseGiver Account Not Activated**\n{@giver}'s account is not activated in the praise system. Unactivated accounts can not praise users. The praiseGiver would have to use the `/activate` command to activate their praise account and to link their eth address.",
    type: 'Textarea',
    label: 'Forwarding from Unauthorized Giver',
    description: 'Discord /forward command error response',
  },
  {
    key: 'FORWARD_FROM_USER_WITHOUT_PRAISE_GIVER_ROLE_ERROR',
    value:
      '**❌ praiseGiver does not have `{role}` role**\nPraise can only be dished by or forwarded from members with the {@role} role.',
    type: 'Textarea',
    label: 'Forwarding from Un-activated Giver',
    description: 'Discord /forward command error response',
  },
];

const up = async (): Promise<void> => {
  const settingUpdates = settings.map((s) => ({
    updateOne: {
      filter: { key: s.key },

      // Insert setting if not found, otherwise continue
      update: { $setOnInsert: { ...s } },
      upsert: true,
    },
  })) as any;

  await SettingModel.bulkWrite(settingUpdates);
};

const down = async (): Promise<void> => {
  const allKeys = settings.map((s) => s.key);
  await SettingModel.deleteMany({ key: { $in: allKeys } });
};

export { up, down };
