import { EventLogTypeModel } from '../../eventlog/entities';

const eventLogTypes = [
  {
    key: 'PERMISSION',
    label: 'User Permissions',
    description: 'An action that changes user permissions',
  },
  {
    key: 'AUTHENTICATION',
    label: 'User Authentication',
    description: 'An action to authenticate or register a user',
  },
  {
    key: 'PERIOD',
    label: 'Periods',
    description: 'An action on a period',
  },
  {
    key: 'PRAISE',
    label: 'Periods',
    description: 'A praise action',
  },
  {
    key: 'PRAISE',
    label: 'Periods',
    description: 'A praise action',
  },
];

const up = async (): Promise<void> => {
  const upsertQueries = eventLogTypes.map((s) => ({
    updateOne: {
      filter: { key: s.key },

      // Insert item if not found, otherwise continue
      update: { $setOnInsert: { ...s } },
      upsert: true,
    },
  }));

  await EventLogTypeModel.bulkWrite(upsertQueries);
};

const down = async (): Promise<void> => {
  const allKeys = eventLogTypes.map((s) => s.key);
  await EventLogTypeModel.deleteMany({ key: { $in: allKeys } });
};

export { up, down };
