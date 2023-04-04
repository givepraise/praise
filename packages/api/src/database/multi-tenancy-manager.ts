import { logger } from '../shared/logger';
import { randomBytes } from 'crypto';
import { MongoClient } from 'mongodb';
import { AuthRole } from '../auth/enums/auth-role.enum';
import {
  DB_URL_ROOT,
  DB_NAME_MAIN,
  HOSTNAME_TEST,
  DB_URL_MAIN_DB,
} from '../constants/constants.provider';
import { databaseExists } from './utils/database-exists';
import mongoose, { ConnectOptions } from 'mongoose';
import { dbNameCommunity } from './utils/community-db-name';
import {
  Community,
  CommunitySchema,
} from '../community/schemas/community.schema';

export class MultiTenancyManager {
  private mongodb: MongoClient;

  private readonly singleSetupHostname: string =
    process.env.NODE_ENV === 'testing' ? HOSTNAME_TEST : process.env.HOST || '';

  private singleSetupCommunityDbName: string = dbNameCommunity({
    hostname: this.singleSetupHostname,
  });

  private communityModel: mongoose.Model<Community>;

  /**
   * Create initial community based on env variables. Take the .env
   * variables already defined and as best as possible create a community
   * based on them. This initial creation is only for standalone Praise
   * instances. For Praise instances that are part of a multi-setup, the
   * initial community will be created by the community service.
   */
  async createInitialCommunity() {
    // Create community based on env variables
    logger.info(
      `${DB_NAME_MAIN}: Creating initial community based on env variables`,
    );
    const admins = process.env.ADMINS || '';
    const communityData = {
      hostname: this.singleSetupHostname,
      name: process.env.HOST,
      database: this.singleSetupCommunityDbName,
      creator: admins.split(',')[0],
      owners: admins.split(','),
      discordGuildId: process.env.DISCORD_GUILD_ID,
      isPublic: true,
      discordLinkNonce: randomBytes(10).toString('hex'),
      discordLinkState: 'ACTIVE',
      email: 'unknown@email.com',
    };
    await this.communityModel.create(communityData);
  }

  /**
   * Create community database and copy all data from main database. This
   * is only for standalone Praise instances. For Praise instances that are
   * part of a multi-setup, the community database will be created by the
   * community service.
   */
  async setupInitialCommunityDb() {
    logger.info(
      `Setting up initial community database: ${this.singleSetupCommunityDbName}`,
    );
    try {
      const dbFrom = this.mongodb.db(DB_NAME_MAIN);

      // Community database name = host name defined in .env. Test community
      // database has a predefined name.
      const dbTo = this.mongodb.db(this.singleSetupCommunityDbName);

      // Loop through all collections in main database and move them to
      // the community database.
      const collections = await dbFrom.listCollections().toArray();
      for (const collection of collections) {
        const collectionName = collection.name;
        const skipCollections = ['communities'];
        if (skipCollections.includes(collectionName)) {
          // Skip communities collection that will remain in the main
          // database
          continue;
        }

        // Copy collection data
        const collectionData = await dbFrom
          .collection(collectionName)
          .find()
          .toArray();
        const newCollection = dbTo.collection(collectionName);
        if (collectionData.length === 0) {
          // Skip empty collections
          try {
            await dbFrom.collection(collectionName).drop();
          } catch (error) {
            logger.error(error.message);
          }
          continue;
        }
        await newCollection.insertMany(collectionData);

        // Copy indexes
        const indexes = await dbFrom.collection(collectionName).indexes();
        for (const index of indexes) {
          await newCollection.createIndex(index.key, index);
        }

        // Drop old collection
        await dbFrom.collection(collectionName).drop();
      }

      // Grant readwrite permissions to new database
      const dbAdmin = this.mongodb.db().admin();
      await dbAdmin.command({
        grantRolesToUser: process.env.MONGO_USERNAME,
        roles: [{ role: 'readWrite', db: this.singleSetupCommunityDbName }],
      });
    } catch (error) {
      logger.error(error.message);
    }
  }

  /**
   * Grant access to default db user to all commmunity databases.
   */
  async grantAccessToAllDatabases() {
    logger.info(
      'Granting access to default db user to all community databases',
    );
    try {
      const communities = await this.communityModel.find();
      const dbAdmin = this.mongodb.db().admin();

      for (const community of communities) {
        await dbAdmin.command({
          grantRolesToUser: process.env.MONGO_USERNAME,
          roles: [{ role: 'readWrite', db: dbNameCommunity(community) }],
        });
      }
    } catch (error) {
      logger.error(error.message);
    }
  }

  /**
   * Create admin users for all communities based on settings in Community
   * collection. Owners of a community will be granted admin access to the
   * community database.
   */
  async crudOwnersOnAllDatabases() {
    logger.info(
      `Syncronizing admin users for all communities based on settings in Community collection`,
    );
    try {
      const communities = await this.communityModel.find();

      // Loop through all communities
      for (const community of communities) {
        const db = this.mongodb.db(dbNameCommunity(community));

        // Create or get users collection
        let users = db.collection('users');
        if (!users) {
          users = await db.createCollection('users');
        }

        // Loop through all owners and create admin users
        for (const eth of community.owners) {
          let user = await users.findOne({ identityEthAddress: eth });
          if (!user) {
            // Find user using "old" field name as well for backwards compatibility
            user = await users.findOne({ ethereumAddress: eth });
          }
          if (user) {
            logger.info(
              `${dbNameCommunity(
                community,
              )}: Setting admin and user role for ${eth}`,
            );
            if (!user.roles.includes(AuthRole.ADMIN)) {
              await users.updateOne(
                { _id: user._id },
                { $push: { roles: AuthRole.ADMIN } },
              );
            }
            if (!user.roles.includes(AuthRole.USER)) {
              await users.updateOne(
                { _id: user._id },
                { $push: { roles: AuthRole.USER } },
              );
            }
          } else {
            logger.info(
              `${dbNameCommunity(community)}: Creating admin user ${eth}`,
            );
            await users.insertOne({
              identityEthAddress: eth,
              rewardsEthAddress: eth,
              username: eth.substring(0, 20),
              roles: [AuthRole.ADMIN, AuthRole.USER],
            });
          }
        }
      }
    } catch (error) {
      logger.error(error.message);
    }
  }

  /**
   * Run the multi-tenancy manager.
   *
   * 1. When no migration to the multi-tenant setup has been done yet:
   * - Create a new community record based on information from the .env file
   * - Create a new database for the community
   * - Give db user access to the new database
   * - Copy data from the main database to the new database
   * - Drop the old collections from the main database
   *
   * 2. When the multi-tenant setup has been migrated already:
   * - Grant readwrite permissions to all databases
   * - Create or update users with admin role
   */
  async run() {
    logger.info('Running multi-tenancy manager...');

    try {
      // Create db connection to admin database
      this.mongodb = new MongoClient(DB_URL_ROOT);

      // Create db connection. Leaving out the db name will connect to the
      // default database, specified in the .env file.
      const mongooseConn = await mongoose.connect(DB_URL_MAIN_DB, {
        useNewUrlParser: true,
      } as ConnectOptions);

      this.communityModel = mongoose.model('Community', CommunitySchema);

      // if there is no community migrated to the multi-tenant setup yet,
      // assume that the current community is the first one and perform the initial
      // migration.
      if (
        !(await databaseExists(this.singleSetupCommunityDbName, this.mongodb))
      ) {
        await this.createInitialCommunity();
        await this.setupInitialCommunityDb();
      }

      // Grant readwrite permissions to all databases
      await this.grantAccessToAllDatabases();

      // Create or update users with admin role
      await this.crudOwnersOnAllDatabases();

      // Cleanup
      await mongooseConn.disconnect();
      await this.mongodb.close();
    } catch (error) {
      logger.error(error.message);
    }
  }
}
