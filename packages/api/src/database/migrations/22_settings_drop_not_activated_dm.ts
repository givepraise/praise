import { SettingGroup } from '@/settings/types';
import { SettingsModel } from '@/settings/entities';

const deleteSettings = [
  {
    key: 'PRAISE_ACCOUNT_NOT_ACTIVATED_ERROR_DM',
    group: SettingGroup.DISCORD,
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
