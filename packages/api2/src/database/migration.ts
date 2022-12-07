import { Umzug, MongoDBStorage } from 'umzug';
import { INestApplication } from '@nestjs/common';
import { PraiseService } from '@/praise/praise.service';
import { UsersService } from '@/users/users.service';
import { PeriodsService } from '@/periods/periods.service';
import { SettingsService } from '@/settings/settings.service';
import { PeriodSettingsService } from '@/periodsettings/periodsettings.service';
import { UtilsProvider } from '@/utils/utils.provider';
import { closeDatabaseConnection, connectDatabase } from './connection';

/**
 * Configure Umzug (database migration library) and run migrations
 *
 * @returns {Umzug}
 */
const runDatabaseMigrations = async (app: INestApplication): Promise<void> => {
  const db = await connectDatabase('localhost');

  const migrator = new Umzug({
    migrations: { glob: 'src/database/migrations/*.ts' },
    storage: new MongoDBStorage({
      connection: db.connection,
      collectionName: 'migrations',
    }),
    logger: console,
    context: {
      praiseService: app.get(PraiseService),
      usersService: app.get(UsersService),
      periodsService: app.get(PeriodsService),
      settingsService: app.get(SettingsService),
      periodSettingsService: app.get(PeriodSettingsService),
      utilsProvider: app.get(UtilsProvider),
    },
  });

  require('ts-node/register');
  await migrator.up();

  await closeDatabaseConnection();
};

export { runDatabaseMigrations };
