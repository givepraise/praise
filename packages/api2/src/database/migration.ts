import { Umzug, MongoDBStorage } from 'umzug';
import { Connection } from 'mongoose';

/**
 * Configure and instantiate Umzug (database migration library)
 *
 * @param {Connection} connection
 * @returns {Umzug}
 */
const setupMigrator = (connection: Connection): Umzug => {
  const migrator = new Umzug({
    migrations: { glob: 'src/database/migrations/*.ts' },
    storage: new MongoDBStorage({ connection, collectionName: 'migrations' }),
    logger: console,
  });

  return migrator;
};

export { setupMigrator };
