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
];

const up = async (): Promise<void> => {
  await SettingsModel.insertMany(deleteSettings);
};

const down = async (): Promise<void> => {
  const deleteSettingKeys = deleteSettings.map((s) => s.key);

  await SettingsModel.deleteMany({ key: { $in: deleteSettingKeys } });
};

export { up, down };
