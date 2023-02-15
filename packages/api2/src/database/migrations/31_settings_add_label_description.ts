import { SettingModel } from '../schemas/settings/00_settings.schema';

const settings = [
  {
    key: 'PRAISE_QUANTIFIERS_PER_PRAISE_RECEIVER',
    label: 'Quantifiers Per Praise',
    description:
      'How many quantifiers are assigned to each praise?',
  }
];

const up = async (): Promise<void> => {
  const settingUpdates = settings.map((s) => ({
    updateOne: {
      filter: { key: s.key },
      update: { $set: { label: s.label, description: s.description } },
      upsert: true,
    },
  }));

  await SettingModel.bulkWrite(settingUpdates);
};

const down = async (): Promise<void> => {
  const allKeys = settings.map((s) => s.key);
  await SettingModel.updateMany(
    { key: { $in: allKeys } },
    { $set: { label: undefined, description: undefined } },
  );
};

export { up, down };
