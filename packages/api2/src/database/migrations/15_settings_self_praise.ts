import { SettingGroup } from '../../settings/enums/settings-group.enum';
import { SettingModel } from '../schemas/settings/07_settings.schema';

const settings = [
  {
    key: 'SELF_PRAISE_ALLOWED',
    value: false,
    type: 'Boolean',
    label: 'Self Praise Allowed',
    description: 'Checking this box allows users to praise themselves.',
    group: SettingGroup.DISCORD,
  },
  {
    key: 'SELF_PRAISE_WARNING',
    value:
      '**⚠️  Self Praise Not Allowed**\nPraise givers can not praise themselves.',
    type: 'Textarea',
    label: 'Self Praise Warning Message',
    description:
      'Message sent when self-praise is restricted and praise givers try to praise themselves',
    group: SettingGroup.DISCORD,
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
