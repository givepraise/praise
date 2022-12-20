import { SettingGroup } from '../../settings/interfaces/settings-group.interface';
import { SettingModel } from '../schemas/settings/07_settings.schema';

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

  await SettingModel.deleteMany({ key: { $in: deleteSettingKeys } });
};

const down = async (): Promise<void> => {
  await SettingModel.insertMany(deleteSettings);
};

export { up, down };
