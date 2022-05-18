import { SettingGroup } from '@settings/types';
import { SettingsModel } from '@settings/entities';

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

  await SettingsModel.deleteMany({ key: { $in: deleteSettingKeys } });
};

const down = async (): Promise<void> => {
  await SettingsModel.insertMany(deleteSettings);
};

export { up, down };
