import { Umzug, MongoDBStorage } from 'umzug';
import { INestApplication } from '@nestjs/common';
import { PraiseService } from '@/praise/praise.service';
import { UsersService } from '@/users/users.service';
import { PeriodsService } from '@/periods/periods.service';
import { SettingsService } from '@/settings/settings.service';
import { PeriodSettingsService } from '@/periodsettings/periodsettings.service';
import { UtilsProvider } from '@/utils/utils.provider';
import { closeDatabaseConnection, connectDatabase } from './connection';
import { PermissionsGuard } from '@/auth/guards/permissions.guard';
import { Logger } from '@/shared/logger';

/**
 * Configure Umzug (database migration library) and run migrations
 *
 * @returns {Umzug}
 */
const runDatabaseMigrations = async (app: INestApplication): Promise<void> => {
  const logger = new Logger(PermissionsGuard.name);

  try {
    const db = await connectDatabase('localhost');
    logger.log('Connected to database');

    const migrator = new Umzug({
      migrations: { glob: 'src/database/migrations/*.ts' },
      storage: new MongoDBStorage({
        connection: db.connection,
        collectionName: 'migrations',
      }),
      logger,
      context: {
        praiseService: app.get(PraiseService),
        usersService: app.get(UsersService),
        periodsService: app.get(PeriodsService),
        settingsService: app.get(SettingsService),
        periodSettingsService: app.get(PeriodSettingsService),
        utilsProvider: app.get(UtilsProvider),
      },
    });
    logger.log('Migrator created');

    require('ts-node/register');
    await migrator.up();
    logger.log('Migrations run');

    await closeDatabaseConnection();
    logger.log('Database connection closed');
  } catch (error) {
    logger.error(error);
  }
};

export { runDatabaseMigrations };
