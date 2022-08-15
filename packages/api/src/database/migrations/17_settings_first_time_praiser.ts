import { SettingGroup } from '@/settings/types';
import { SettingsModel } from '../../settings/entities';

const settings = [
  {
    key: 'FIRST_TIME_PRAISER',
    value:
      '**🎉 Welcome first time praiser! **\n Now that you have sent your first praise, learn more about how to write excellent praise: https://givepraise.xyz/docs/writing-excellent-praise',
    type: 'Textarea',
    label: 'First Time Praiser Message',
    description: 'Make a great new praise!',
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
  }));

  await SettingsModel.bulkWrite(settingUpdates);
};

const down = async (): Promise<void> => {
  const allKeys = settings.map((s) => s.key);
  await SettingsModel.deleteMany({ key: { $in: allKeys } });
};

export { up, down };
