import { Umzug, MongoDBStorage } from 'umzug';
import { Connection } from 'mongoose';

/**
 * Configure and instantiate Umzug (database migration library)
 *
 * @param {Connection} connection
 * @returns {Umzug}
 */
const setupMigrator = (connection: Connection, context: any): Umzug => {
  const migrator = new Umzug({
    migrations: { glob: 'src/database/migrations/*.ts' },
    storage: new MongoDBStorage({ connection, collectionName: 'migrations' }),
    logger: console,
    context,
  });

  return migrator;
};

const runMigrations = async (migrator: Umzug, context: any): Promise<void> => {  
  await migrator.up(context);
};

export { setupMigrator, runMigrations };
