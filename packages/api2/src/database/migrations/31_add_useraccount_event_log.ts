import { EventLogTypeKey } from '@/event-log/enums/event-log-type-key';
import { MigrationsContext } from '../interfaces/migration-context.interface';
import { EventLogTypeModel } from '../schemas/event-log-type/event-log-type.schema';

const eventLogTypes = [
  {
    key: EventLogTypeKey.USER_ACCOUNT,
    label: 'UserAccount',
    description: 'An action to UserAccounts',
  },
];

const up = async ({ context }: MigrationsContext): Promise<void> => {
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

export { up };
