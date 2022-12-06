import { SettingGroup } from '@/settings/interfaces/settings-group.interface';
import { model } from 'mongoose';
import { SettingSchema } from '../schemas/settings/07_settings.schema';

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
  })) as any;

  const SettingModel = model('Setting', SettingSchema);
  await SettingModel.bulkWrite(settingUpdates);
};

const down = async (): Promise<void> => {
  const allKeys = settings.map((s) => s.key);
  const SettingModel = model('Setting', SettingSchema);
  await SettingModel.deleteMany({ key: { $in: allKeys } });
};

export { up, down };
