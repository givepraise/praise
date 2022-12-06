import { SettingGroup } from '@/settings/interfaces/settings-group.interface';
import { model } from 'mongoose';
import { SettingSchema } from '../schemas/settings/07_settings.schema';

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
  const SettingModel = model('Setting', SettingSchema);
  await SettingModel.insertMany(deleteSettings);
};

const down = async (): Promise<void> => {
  const deleteSettingKeys = deleteSettings.map((s) => s.key);

  const SettingModel = model('Setting', SettingSchema);
  await SettingModel.deleteMany({ key: { $in: deleteSettingKeys } });
};

export { up, down };
