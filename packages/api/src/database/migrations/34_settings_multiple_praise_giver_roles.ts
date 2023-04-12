import { SettingModel } from '../schemas/settings/23_settings.schema';

const settings = [
  {
    key: 'PRAISE_GIVER_ROLE_ID',
    label: 'Praise Giver Discord Roles',
    description:
      'Discord Role IDs authorized to praise or forward praise. Used only if "Praise Giver Discord Role Required" is checked. Separate multiple IDs with commas.',
    type: 'StringList' as const,
  },
];

const up = async (): Promise<void> => {
  const settingUpdates = settings.map((s) => ({
    updateOne: {
      filter: { key: s.key },
      update: {
        $set: { ...s },
      },
      upsert: true,
    },
  }));

  SettingModel.bulkWrite(settingUpdates);
};

const down = (): Promise<void> => Promise.resolve();

export { up, down };
