import { SettingGroup } from '@/settings/types';
import { SettingsModel } from '../../settings/entities';

const settings = [
  {
    key: 'FIRST_TIME_PRAISER',
    value:
      '**⚠️  We noticed this is the first time you praise**\n Here is some good info about what makes good Praise.',
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
