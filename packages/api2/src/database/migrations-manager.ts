import { NestFactory } from '@nestjs/core';
import { MongoClient } from 'mongodb';
import { adminDbUrl, MAIN_DB_NAME } from '../constants/constants.provider';
import { logger } from '../shared/logger';
import { AppMigrationsModule } from './app.migrations.module';

export class MigrationsManager {
  //private app: INestApplication;

  // constructor() {
  // Run database migrations before starting the app
  // NestFactory.create(AppMigrationsModule).then((app) => {
  //   this.app = app;
  // });
  // await runDbMigrations(appMigrations, logger);
  // await appMigrations.close();
  // }

  private mongodb: MongoClient;

  constructor() {
    this.mongodb = new MongoClient(adminDbUrl);
  }

  async close() {
    await this.mongodb.close();
  }

  run = async (): Promise<void> => {
    try {
      await this.mongodb.connect();

      // List all communities
      const dbMain = this.mongodb.db(MAIN_DB_NAME);
      const communities = await dbMain
        .collection('communities')
        .find()
        .toArray();

      // For each community, run the migrations
      for (const community of communities) {
        logger.info(`Running migrations for community ${community.name}`);
      }
    } catch (error) {
      logger.error(error.message);
    }

    //   try {
    //     const db = await connectDatabase();
    //     logger && logger.info('Connected to database');

    //     const migrator = new Umzug({
    //       migrations: { glob: 'src/database/migrations/*.ts' },
    //       storage: new MongoDBStorage({
    //         connection: db.connection,
    //         collectionName: 'migrations',
    //       }),
    //       logger: console,
    //       context: {
    //         praiseService: app.get(PraiseService),
    //         usersService: app.get(UsersService),
    //         periodsService: app.get(PeriodsService),
    //         settingsService: app.get(SettingsService),
    //         periodSettingsService: app.get(PeriodSettingsService),
    //         quantificationsService: app.get(QuantificationsService),
    //       },
    //     });
    //     logger && logger.info('Migrator created');

    //     /**
    //      * Register ts-node to be able to run typescript migrations
    //      */
    //     require('ts-node/register');

    //     /**
    //      * Run migrations
    //      */
    //     await migrator.up();
    //     logger && logger.info('Migrations run');

    //     /**
    //      * Make sure that users defined in env variables are set as admin
    //      * This is done after migrations to make sure that the user exists
    //      * in the database
    //      */
    //     //TODO: Loop through all Communities and set admin users
    //     await app.get(UsersService).setEnvAdminUsers();

    //     await closeDatabaseConnection();
    //     logger && logger.info('Database connection closed');
    //   } catch (error) {
    //     logger && logger.error(error.message);
    //     throw error;
    //   }
    // };
  };
}
