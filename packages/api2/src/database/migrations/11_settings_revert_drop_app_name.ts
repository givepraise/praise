import { SettingGroup } from '../../settings/interfaces/settings-group.interface';
import { SettingModel } from '../schemas/settings/07_settings.schema';

const deleteSettings = [
  {
    key: 'NAME',
    label: 'App Name',
    description: null,
    group: SettingGroup.APPLICATION,
    value: 'Praise',
    type: 'String',
    periodOverridable: false,
  },
];

const up = async (): Promise<void> => {
  await SettingModel.insertMany(deleteSettings);
};

const down = async (): Promise<void> => {
  const deleteSettingKeys = deleteSettings.map((s) => s.key);

  await SettingModel.deleteMany({ key: { $in: deleteSettingKeys } });
};

export { up, down };
