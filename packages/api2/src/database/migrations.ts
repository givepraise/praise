import { Umzug, MongoDBStorage } from 'umzug';
import { INestApplication } from '@nestjs/common';
import { PraiseService } from '@/praise/services/praise.service';
import { UsersService } from '@/users/users.service';
import { PeriodsService } from '@/periods/services/periods.service';
import { SettingsService } from '@/settings/settings.service';
import { PeriodSettingsService } from '@/periodsettings/periodsettings.service';
import { Logger } from '@/shared/logger';
import { QuantificationsService } from '@/quantifications/services/quantifications.service';

import mongoose, { ConnectOptions } from 'mongoose';

interface DatabaseConfig {
  MONGO_USERNAME: string;
  MONGO_PASSWORD: string;
  MONGO_HOST: string;
  MONGO_PORT: string;
  MONGO_DB: string;
}

/**
 * Connect to mongodb database with mongoose and return connected mongoose client
 *
 * @param {(DatabaseConfig | {})} [configOverride={}]
 * @returns {Promise<typeof mongoose>}
 */
const connectDatabase = async (
  configOverride?: DatabaseConfig,
): Promise<typeof mongoose> => {
  const { MONGO_USERNAME, MONGO_PASSWORD, MONGO_HOST, MONGO_PORT, MONGO_DB } =
    process.env;

  const configEnv = {
    MONGO_USERNAME,
    MONGO_PASSWORD,
    MONGO_HOST,
    MONGO_PORT,
    MONGO_DB,
  } as DatabaseConfig;

  const config = {
    ...configEnv,
    ...configOverride,
  } as DatabaseConfig;

  const uri = `mongodb://${config.MONGO_USERNAME}:${config.MONGO_PASSWORD}@${config.MONGO_HOST}:${config.MONGO_PORT}/${config.MONGO_DB}?authSource=admin`;

  try {
    const db = await mongoose.connect(uri, {
      useNewUrlParser: true,
    } as ConnectOptions);

    return db;
  } catch (error) {
    throw Error('Could not connect to database');
  }
};

/**
 * Close database connection
 * @returns {Promise<void>}
 * @memberof Database
 * @throws {Error} - If connection could not be closed successfully (e.g. connection does not exist) an error is thrown
 */
export const closeDatabaseConnection = async (): Promise<void> => {
  await mongoose.connection.close();
};

/**
 * Configure Umzug (database migration library) and run migrations
 *
 * @returns {Umzug}
 */
export const runDbMigrations = async (
  app: INestApplication,
  logger?: Logger,
): Promise<void> => {
  try {
    const db = await connectDatabase();
    logger && logger.log('Connected to database');

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
        quantificationsService: app.get(QuantificationsService),
      },
    });
    logger && logger.log('Migrator created');

    require('ts-node/register');
    await migrator.up();
    logger && logger.log('Migrations run');

    await closeDatabaseConnection();
    logger && logger.log('Database connection closed');
  } catch (error) {
    logger && logger.error(error);
    throw error;
  }
};
