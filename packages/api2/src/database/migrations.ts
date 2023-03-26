import { Umzug, MongoDBStorage } from 'umzug';
import { INestApplication } from '@nestjs/common';
import { PraiseService } from '../praise/services/praise.service';
import { UsersService } from '../users/users.service';
import { PeriodsService } from '../periods/services/periods.service';
import { SettingsService } from '../settings/settings.service';
import { PeriodSettingsService } from '../periodsettings/periodsettings.service';
import { QuantificationsService } from '../quantifications/services/quantifications.service';

import mongoose, { ConnectOptions } from 'mongoose';
import { MAIN_DB_NAME } from '../constants/constants.provider';
import { Logger } from 'winston';
import { MongoClient } from 'mongodb';

interface DatabaseConfig {
  MONGO_USERNAME: string;
  MONGO_PASSWORD: string;
  MONGO_HOST: string;
  MONGO_PORT: string;
  MONGO_DB: string;
}

/**
 * Check if a database exists. Returns true if it does, false if it doesn't. Uses the admin database to check.
 */
async function checkDatabaseExists(databaseName: string) {
  const dbAdminUrl = `mongodb://${process.env.MONGO_INITDB_ROOT_USERNAME}:${process.env.MONGO_INITDB_ROOT_PASSWORD}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}?authSource=admin&appname=PraiseApiMigrations`;
  const client = new MongoClient(dbAdminUrl);

  try {
    // Connect to the MongoDB server
    await client.connect();

    // Get the list of databases
    const databasesList = await client.db().admin().listDatabases();

    // Check if the database exists in the list
    const databaseExists = databasesList.databases.some(
      (db) => db.name === databaseName,
    );

    return databaseExists;
  } catch (error) {
    // Close the connection to the MongoDB server
    await client.close();
    throw new Error(error);
  } finally {
    // Close the connection to the MongoDB server
    await client.close();
  }
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
  const { MONGO_USERNAME, MONGO_PASSWORD, MONGO_HOST, MONGO_PORT } =
    process.env;

  const configEnv = {
    MONGO_USERNAME,
    MONGO_PASSWORD,
    MONGO_HOST,
    MONGO_PORT,
    MONGO_DB: MAIN_DB_NAME,
  } as DatabaseConfig;

  const config = {
    ...configEnv,
    ...configOverride,
  } as DatabaseConfig;

  try {
    const uri = (dbName: string) =>
      `mongodb://${config.MONGO_USERNAME}:${config.MONGO_PASSWORD}@${config.MONGO_HOST}:${config.MONGO_PORT}/${dbName}?authSource=admin`;

    let db: typeof mongoose;
    if (await checkDatabaseExists(process.env.HOST || '')) {
      db = await mongoose.connect(uri(process.env.HOST || ''), {
        useNewUrlParser: true,
      } as ConnectOptions);
    } else {
      db = await mongoose.connect(uri(process.env.MONGO_DB || ''), {
        useNewUrlParser: true,
      } as ConnectOptions);
    }

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
    logger && logger.info('Connected to database');

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
    logger && logger.info('Migrator created');

    /**
     * Register ts-node to be able to run typescript migrations
     */
    require('ts-node/register');

    /**
     * Run migrations
     */
    await migrator.up();
    logger && logger.info('Migrations run');

    /**
     * Make sure that users defined in env variables are set as admin
     * This is done after migrations to make sure that the user exists
     * in the database
     */
    //TODO: Loop through all Communities and set admin users
    await app.get(UsersService).setEnvAdminUsers();

    await closeDatabaseConnection();
    logger && logger.info('Database connection closed');
  } catch (error) {
    logger && logger.error(error.message);
    throw error;
  }
};
