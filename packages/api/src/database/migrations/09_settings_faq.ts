import { SettingGroup } from 'types/dist/settings/types';
import { SettingsModel } from '../../settings/entities';

const settings = [
  {
    key: 'PRAISE_FAQ',
    value: '',
    type: 'QuestionAnswerJSON',
    label: 'FAQ',
    description: 'FAQ in JSON format.',
    group: SettingGroup.APPLICATION,
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
