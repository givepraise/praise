import { SettingModel } from '../schemas/settings/23_settings.schema';

const deleteSettings = [
  {
    key: 'CUSTOM_EXPORT_MAP',
  },
  {
    key: 'CUSTOM_EXPORT_CONTEXT',
  },
  {
    key: 'CUSTOM_EXPORT_FORMAT',
  },
];

const up = async (): Promise<void> => {
  // Remove old custom export settings since they are no longer used after
  // the introduction of the new report system.
  const deleteSettingKeys = deleteSettings.map((s) => s.key);
  await SettingModel.deleteMany({ key: { $in: deleteSettingKeys } });

  // Increase the support percentage to 3%.
  await SettingModel.updateOne(
    { key: 'CS_SUPPORT_PERCENTAGE' },
    { $set: { value: 3 } },
  );
};

export { up };
