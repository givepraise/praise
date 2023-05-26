import { SettingModel } from '../schemas/settings/23_settings.schema';

const deleteSettings = [
  {
    key: 'DM_ERROR',
  },
  {
    key: 'PRAISE_REASON_MISSING_ERROR',
  },
  {
    key: 'PRAISE_SUCCESS_DM',
  },
];

const up = async (): Promise<void> => {
  // Remove redundant Discord Bot settings
  const deleteSettingKeys = deleteSettings.map((s) => s.key);
  await SettingModel.deleteMany({ key: { $in: deleteSettingKeys } });

  await SettingModel.updateOne(
    { key: 'PRAISE_GIVER_ROLE_ID' },
    { $set: { defaultValue: null } },
  );
};

export { up };
