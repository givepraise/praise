import { EventLogTypeModel } from '../../eventlog/entities';
import { EventLogTypeKey } from '../../eventlog/types';

const eventLogTypes = [
  {
    key: EventLogTypeKey.PERMISSION,
    label: 'User Permissions',
    description: 'An action that changes user permissions',
  },
  {
    key: EventLogTypeKey.AUTHENTICATION,
    label: 'User Authentication',
    description: 'An action to authenticate or register a user',
  },
  {
    key: EventLogTypeKey.PERIOD,
    label: 'Period',
    description: 'An action on a period',
  },
  {
    key: EventLogTypeKey.PRAISE,
    label: 'Praise',
    description: 'A praise action',
  },
  {
    key: EventLogTypeKey.COMMUNICATION,
    label: 'Communication',
    description: 'An action to send messages to users',
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
