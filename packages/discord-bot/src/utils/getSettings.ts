import { SettingsModel } from 'api/dist/settings/entities';

export const getSetting = async (
  settingKey: string
): Promise<string | number> => {
  const setting = await SettingsModel.findOne({ key: settingKey });
  return setting?.value || '';
};

/*
export const getAllSettings = async () => {
  const setting = await SettingsModel.find({});
  return setting;
};
*/
