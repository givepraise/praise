import { SettingGroup } from '@/settings/interfaces/settings-group.interface';
import { model } from 'mongoose';
import { SettingSchema } from '../schemas/settings/07_settings.schema';

const deleteSettings = [
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
  const deleteSettingKeys = deleteSettings.map((s) => s.key);

  const SettingModel = model('Setting', SettingSchema);
  await SettingModel.deleteMany({ key: { $in: deleteSettingKeys } });
};

const down = async (): Promise<void> => {
  const SettingModel = model('Setting', SettingSchema);
  await SettingModel.insertMany(deleteSettings);
};

export { up, down };
