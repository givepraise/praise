import { NestFactory } from '@nestjs/core';
import { MongoClient } from 'mongodb';
import { MongoDBStorage, Umzug } from 'umzug';
import { Community } from '../community/schemas/community.schema';
import { MONGODB_MAIN_DB } from '../constants/constants.provider';
import { PeriodsService } from '../periods/services/periods.service';
import { PraiseService } from '../praise/services/praise.service';
import { QuantificationsService } from '../quantifications/services/quantifications.service';
import { SettingsService } from '../settings/settings.service';
import { logger } from '../shared/logger';
import { UsersService } from '../users/users.service';
import { AppMigrationsModule } from './modules/app-migrations.module';
import { dbUrlCommunity } from './utils/db-url-community';
import mongoose, { ConnectOptions } from 'mongoose';
import { AuthRole } from '../auth/enums/auth-role.enum';

export class MigrationsManager {
  /**
   * Run db migrations for named community. The migrations are run in the context of the community db.
   * A dynamic module is created for the community db and the context is passed to the migrations.
   */
  async migrate(community: Community) {
    let mongooseConn;
    try {
      logger.info(`🆙 Starting migrations for: ${community.hostname}`);

      try {
        await mongoose.connect(dbUrlCommunity(community), {
          useNewUrlParser: true,
        } as ConnectOptions);
      } catch (err) {
        // do nothing
      }
      mongooseConn = mongoose.connection;

      // Create a dynamic app module for the community
      const app = await NestFactory.createApplicationContext(
        AppMigrationsModule.forRoot(dbUrlCommunity(community)),
      );

      // Init the app
      await app.init();

      // Setup migrator
      const migrator = new Umzug({
        migrations: { glob: 'src/database/migrations/*.ts' },
        storage: new MongoDBStorage({
          connection: mongooseConn,
        }),
        logger,
        context: {
          praiseService: app.get(PraiseService),
          usersService: app.get(UsersService),
          periodsService: app.get(PeriodsService),
          settingsService: app.get(SettingsService),
          quantificationsService: app.get(QuantificationsService),
        },
      });

      // Run the migrations
      await migrator.up();

      const usersService = app.get(UsersService);
      for (const owner of community.owners) {
        try {
          const user = await usersService.findOneByEth(owner);
          logger.debug(`[${community.hostname}] Setting roles for ${owner}`);
          await usersService.update(user._id, {
            username: user.username.toLocaleLowerCase(),
            roles: [AuthRole.ROOT, AuthRole.ADMIN, AuthRole.USER],
          });
        } catch (err) {
          logger.debug(
            `[${community.hostname}] Creating owner user for ${owner}`,
          );
          await usersService.create({
            username: owner.toLowerCase(),
            identityEthAddress: owner,
            rewardsEthAddress: owner,
            roles: [AuthRole.ROOT, AuthRole.ADMIN, AuthRole.USER],
          });
        }
      }

      // Close the app
      await app.close();

      // Cleanup
      mongoose.connection.close();

      logger.info(`✅ Migrations completed for: ${community.hostname}`);
    } catch (error) {
      logger.error(error.message);
    } finally {
      if (mongooseConn) {
        await mongooseConn.close();
      }
      mongoose.connection.close();
    }
  }

  /**
   * Run db migrations for all communities
   */
  async run(): Promise<void> {
    try {
      if (!process.env.MONGO_ADMIN_URI) {
        throw new Error('MONGO_ADMIN_URI not set');
      }

      // Connect to the main db to access community list
      const mongodb = new MongoClient(process.env.MONGO_ADMIN_URI);

      // Register ts-node to be able to run typescript migrations
      require('ts-node/register');

      // List all communities
      const dbMain = mongodb.db(MONGODB_MAIN_DB);
      const communities = await dbMain
        .collection('communities')
        .find()
        .toArray();

      // For each community, run the migrations
      for (const community of communities) {
        await this.migrate(community as Community);
      }

      // Cleanup
      mongodb.close();
    } catch (error) {
      logger.error(error.message);
    }
  }
}
