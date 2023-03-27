import { EventLogTypeModel } from '../schemas/event-log-type/event-log-type.schema';

enum EventLogTypeKey {
  PERMISSION = 'PERMISSION',
  AUTHENTICATION = 'AUTHENTICATION',
  PERIOD = 'PERIOD',
  PRAISE = 'PRAISE',
  QUANTIFICATION = 'QUANTIFICATION',
  SETTING = 'SETTING',
  USER_ACCOUNT = 'USER_ACCOUNT',
}

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
    description: 'An action to give praise',
  },
  {
    key: EventLogTypeKey.SETTING,
    label: 'Setting',
    description: 'An action that changes a setting',
  },
  {
    key: EventLogTypeKey.QUANTIFICATION,
    label: 'Quantification',
    description: 'An action to quantify praise',
  },
  {
    key: EventLogTypeKey.USER_ACCOUNT,
    label: 'UserAccount',
    description: 'An action to UserAccounts',
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
