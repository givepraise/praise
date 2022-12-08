import { SettingGroup } from '@/settings/interfaces/settings-group.interface';
import { SettingModel } from '../schemas/settings/07_settings.schema';

const deleteSettings = [
  {
    key: 'NAME',
    label: 'App Name',
    description: null,
    group: SettingGroup.APPLICATION,
    value: 'Praise',
    type: 'String',
  },
  {
    key: 'DESCRIPTION',
    label: 'App Description',
    description: null,
    group: SettingGroup.APPLICATION,
    value:
      'Praise community contributions, build a culture of giving and gratitude.',
    type: 'Textarea',
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
