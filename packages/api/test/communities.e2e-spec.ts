/* eslint-disable jest-extended/prefer-to-be-true */
import request from 'supertest';
import { Wallet } from 'ethers';
import {
  authorizedGetRequest,
  authorizedPatchRequest,
  authorizedPostRequest,
  loginUser,
} from './shared/request';
import { AuthRole } from '../src/auth/enums/auth-role.enum';
import { User } from '../src/users/schemas/users.schema';
import { Community } from '../src/community/schemas/community.schema';
import { DiscordLinkState } from '../src/community/enums/discord-link-state';
import { randomBytes } from 'crypto';

import {
  app,
  testingModule,
  server,
  usersService,
  usersSeeder,
  communityService,
  communitiesSeeder,
} from './shared/nest';
import { databaseExists } from '../src/database/utils/database-exists';
import { MongoClient } from 'mongodb';
import { dbNameCommunity } from '../src/database/utils/db-name-community';

class LoggedInUser {
  accessToken: string;
  user: User;
  wallet: Wallet;
}

describe('Communities (E2E)', () => {
  let setupWebUserAccessToken: string;
  const users: LoggedInUser[] = [];
  let mongodb: MongoClient;
  beforeAll(async () => {
    if (!process.env.MONGO_ADMIN_URI) {
      throw new Error('MONGO_ADMIN_URI not set');
    }

    mongodb = new MongoClient(process.env.MONGO_ADMIN_URI);

    // Clear the database
    await usersService.getModel().deleteMany({});
    await communityService.getModel().deleteMany({});

    // Seed and login 3 users
    for (let i = 0; i < 3; i++) {
      const wallet = Wallet.createRandom();
      const user = await usersSeeder.seedUser({
        identityEthAddress: wallet.address,
        rewardsAddress: wallet.address,
        roles: [AuthRole.USER, AuthRole.QUANTIFIER],
      });
      const response = await loginUser(app, testingModule, wallet);
      users.push({
        accessToken: response.accessToken,
        user,
        wallet,
      });
    }

    // Seed and login setupWeb user
    const setupWebWallet = Wallet.createRandom();
    await usersSeeder.seedUser({
      identityEthAddress: setupWebWallet.address,
      rewardsAddress: setupWebWallet.address,
      roles: [AuthRole.API_KEY_SETUP_WEB],
    });

    const response = await loginUser(app, testingModule, setupWebWallet);
    setupWebUserAccessToken = response.accessToken;
  });

  afterAll(async () => {
    await mongodb.close();
  });

  describe('POST /api/communities', () => {
    beforeEach(async () => {
      await communityService.getModel().deleteMany({});
    });

    test('401 when not authenticated', async () => {
      return request(server).post(`/communities`).send().expect(401);
    });

    test('403 when user has wrong permissions', async () => {
      const response = await authorizedPostRequest(
        `/communities`,
        app,
        users[0].accessToken,
        {
          name: 'test',
        },
      );

      expect(response.status).toBe(403);
    });

    test('400 when inputs are invalid', async () => {
      const response = await authorizedPostRequest(
        `/communities`,
        app,
        setupWebUserAccessToken,
        {
          name: 'test',
        },
      );

      expect(response.status).toBe(400);
    });

    const createValidCommunity = async (override?: any) => {
      const validCommunity = {
        name: randomBytes(10).toString('hex'),
        hostname: 'test-community.givepraise.xyz',
        creator: users[0].user.identityEthAddress,
        owners: [
          users[0].user.identityEthAddress,
          users[1].user.identityEthAddress,
        ],
        discordGuildId: 'kldakdsal',
        email: 'test@praise.io',
      };

      return authorizedPostRequest(
        `/communities`,
        app,
        setupWebUserAccessToken,
        {
          ...validCommunity,
          ...override,
        },
      );
    };

    test('400 when creator is not a valid eth address', async () => {
      const response = await createValidCommunity({ creator: 'invalid' });
      expect(response.status).toBe(400);
      expect(response.body.message[0]).toBe(
        '(invalid) is not a valid Ethereum address.',
      );
    });

    // Name can only contain only alphanumeric characters, underscores, dots, and hyphen
    test('400 when name contains invalid characters, is not allowed to contain spaces', async () => {
      const response = await createValidCommunity({ name: 'invalid name' });
      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Validation failed');
    });

    test('400 when name is invalid and is in blacklist', async () => {
      for (const name of [
        'www',
        'setup',
        'admin',
        'api',
        'app',
        'mail',
        'docs',
        'blog',
        'help',
        'support',
        'status',
        'about',
        'contact',
        'terms',
        'privacy',
        'tos',
        'legal',
        'security',
      ]) {
        const response = await createValidCommunity({ name });
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Validation failed');
      }
    });

    test('400 when name is too short', async () => {
      const response = await createValidCommunity({ name: 'a' });
      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Validation failed');
    });

    test('400 when name is too long', async () => {
      const response = await createValidCommunity({
        name: 'a'.repeat(200),
      });
      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Validation failed');
    });

    test('409 when name already exists', async () => {
      await createValidCommunity({ name: 'test' });
      const response = await createValidCommunity({
        name: 'test',
        hostname: 'other.com',
      });
      expect(response.status).toBe(409);
      expect(response.body.message).toBe("name 'test 'already exists.");
    });

    test('400 when hostname is not a valid hostname', async () => {
      const response = await createValidCommunity({ hostname: 'inva  lid' });
      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Validation failed');
    });

    test('400 when hostname is not a valid hostname', async () => {
      const response = await createValidCommunity({
        hostname: 'praise.hostname..com',
      });
      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Validation failed');
    });

    test('400 when hostname already exists', async () => {
      await createValidCommunity({ hostname: 'test.test.se' });
      const response = await createValidCommunity({
        hostname: 'test.test.se',
      });
      expect(response.status).toBe(409);
      expect(response.body.error).toBe('Duplicate key');
    });

    test('400 when email is not a valid email', async () => {
      const response = await createValidCommunity({ email: 'invalid' });
      expect(response.status).toBe(400);
      expect(response.body.message[0]).toBe('email must be an email');
    });

    test('400 when owners contains an invalid eth address', async () => {
      const response = await createValidCommunity({
        owners: ['invalid', users[0].user.identityEthAddress],
      });
      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Validation failed');
    });

    test('400 when owners contains a duplicate eth address', async () => {
      const response = await createValidCommunity({
        owners: [
          users[0].user.identityEthAddress,
          users[0].user.identityEthAddress,
        ],
      });
      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Validation failed');
    });

    test('400 when creator is not in owners', async () => {
      const response = await createValidCommunity({
        owners: [users[1].user.identityEthAddress],
      });
      expect(response.status).toBe(400);
    });

    test('400 when owners contain invalid address', async () => {
      const response = await createValidCommunity({
        owners: ['invalid', users[0].user.identityEthAddress],
      });
      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Validation failed');
    });

    test('400 when database is added on creation', async () => {
      const response = await createValidCommunity({
        database: 'test',
      });
      expect(response.status).toBe(400);
      expect(response.body.message[0]).toBe(
        'property database should not exist',
      );
    });

    test('201 when authenticated as setupWeb and correct data is sent', async () => {
      const response = await createValidCommunity();
      const rb = response.body;
      expect(response.status).toBe(201);
      expect(rb.email).toBe('test@praise.io');
      expect(rb.discordLinkNonce.length).toBe(10);
      expect(rb.isPublic).toBe(true);
    });
  });

  describe('PATCH /api/communities/:id/discord/link', () => {
    let community: Community;

    beforeEach(async () => {
      const hostname = `test.patch.community`;
      const dbName = dbNameCommunity({ hostname });
      await communityService.getModel().deleteMany({});
      if (await databaseExists(dbName, mongodb)) {
        // Delete community db if exists (We create db after linking discord to community)
        await mongodb.db().dropDatabase({
          dbName,
        });
      }
      community = await communitiesSeeder.seedCommunity({
        name: 'test-community',
        hostname,
        creator: users[0].user.identityEthAddress,
        owners: [
          users[0].user.identityEthAddress,
          users[1].user.identityEthAddress,
        ],
        discordGuildId: 'kldakdsal',
        discordLinkNonce: '223',
        email: 'test@praise.io',
      });
    });

    test('401 when not authenticated', async () => {
      return request(server)
        .patch(`/communities/${community._id}/discord/link`)
        .send()
        .expect(401);
    });

    test('403 when user has wrong permissions', async () => {
      const response = await authorizedPatchRequest(
        `/communities/${community._id}/discord/link`,
        app,
        users[0].accessToken,
        {
          name: 'test',
        },
      );

      expect(response.status).toBe(403);
    });

    test('400 when inputs are invalid', async () => {
      const response = await authorizedPatchRequest(
        `/communities/${community._id}/discord/link`,
        app,
        setupWebUserAccessToken,
        {
          wrongField: 'test',
        },
      );

      expect(response.status).toBe(400);
    });

    test('200 when authenticated as setupWeb and correct data is sent for linking discord bot to community', async () => {
      const signedMessage = await users[0].wallet.signMessage(
        communityService.generateLinkDiscordMessage({
          communityId: String(community._id),
          guildId: community.discordGuildId as string,
          nonce: community.discordLinkNonce as string,
        }),
      );
      const response = await authorizedPatchRequest(
        `/communities/${community._id}/discord/link`,
        app,
        setupWebUserAccessToken,
        {
          signedMessage,
        },
      );

      const rb = response.body;
      expect(response.status).toBe(200);
      expect(rb.name).toBe('test-community');
      expect(rb.email).toBe('test@praise.io');
      expect(rb.discordLinkState).toBe(DiscordLinkState.ACTIVE);
      expect(rb.isPublic).toBe(true);
    });

    test('200 should create new db for community, after link it to discord', async () => {
      const dbName = dbNameCommunity(community);

      // Before linking Discord to community there is no DB for that community
      // eslint-disable-next-line jest-extended/prefer-to-be-false
      expect(await databaseExists(dbName, mongodb)).toBe(false);

      const signedMessage = await users[0].wallet.signMessage(
        communityService.generateLinkDiscordMessage({
          communityId: String(community._id),
          guildId: community.discordGuildId as string,
          nonce: community.discordLinkNonce as string,
        }),
      );

      const response = await authorizedPatchRequest(
        `/communities/${community._id}/discord/link`,
        app,
        setupWebUserAccessToken,
        {
          signedMessage,
        },
      );

      expect(response.status).toBe(200);
      expect(await databaseExists(dbName, mongodb)).toBe(true);

      const communityDb = mongodb.db(dbName);
      const migrationDocuments = await communityDb
        .collection('migrations')
        .countDocuments();

      // To make sure all migrations has been executed successfully
      expect(migrationDocuments).toBeGreaterThan(0);
    });

    test('400 when someone else wants to link discord to community instead of creator', async () => {
      const signedMessage = await users[2].wallet.signMessage(
        communityService.generateLinkDiscordMessage({
          communityId: String(community._id),
          guildId: community.discordGuildId as string,
          nonce: community.discordLinkNonce as string,
        }),
      );
      const response = await authorizedPatchRequest(
        `/communities/${community._id}/discord/link`,
        app,
        setupWebUserAccessToken,
        {
          signedMessage,
        },
      );

      const rb = response.body;
      expect(response.status).toBe(403);
      expect(rb.code).toBe(1093);
    });

    test('400 when someone wants to link discord to active community', async () => {
      await communityService
        .getModel()
        .updateOne(
          { _id: community._id },
          { $set: { discordLinkState: DiscordLinkState.ACTIVE } },
        );
      const signedMessage = await users[0].wallet.signMessage(
        communityService.generateLinkDiscordMessage({
          communityId: String(community._id),
          guildId: community.discordGuildId as string,
          nonce: community.discordLinkNonce as string,
        }),
      );
      const response = await authorizedPatchRequest(
        `/communities/${community._id}/discord/link`,
        app,
        setupWebUserAccessToken,
        {
          signedMessage,
        },
      );

      const rb = response.body;
      expect(response.status).toBe(400);
      expect(rb.message).toBe('Community is already active');
    });

    test('404 when community not found', async () => {
      const signedMessage = await users[0].wallet.signMessage(
        communityService.generateLinkDiscordMessage({
          communityId: String(community._id),
          guildId: community.discordGuildId as string,
          nonce: community.discordLinkNonce as string,
        }),
      );
      const response = await authorizedPatchRequest(
        `/communities/${users[0].user._id}/discord/link`,
        app,
        setupWebUserAccessToken,
        {
          signedMessage,
        },
      );

      const rb = response.body;
      expect(response.status).toBe(404);
      expect(rb.message).toBe('Community not found');
    });
  });
  describe('GET /api/communities/:id', () => {
    let community: Community;

    beforeEach(async () => {
      await communityService.getModel().deleteMany({});
      community = await communitiesSeeder.seedCommunity({
        name: randomBytes(10).toString('hex'),
        hostname: 'test-community.givepraise.xyz',
        database: 'test-community-givepraise-xyz',
        creator: users[0].user.identityEthAddress,
        owners: [
          users[0].user.identityEthAddress,
          users[1].user.identityEthAddress,
        ],
        discordGuildId: 'kldakdsal',
        discordLinkNonce: randomBytes(10).toString('hex'),
        email: 'test@praise.io',
      });
    });

    test('401 when not authenticated', async () => {
      return request(server)
        .get(`/communities/${community._id}`)
        .send()
        .expect(401);
    });

    test('403 when user has wrong permissions', async () => {
      const response = await authorizedPatchRequest(
        `/communities/${community._id}`,
        app,
        users[0].accessToken,
        {
          name: 'test',
        },
      );

      expect(response.status).toBe(403);
    });

    test('200 get community successfully', async () => {
      const response = await authorizedGetRequest(
        `/communities/${community._id}`,
        app,
        setupWebUserAccessToken,
      );

      const rb = response.body;
      expect(response.status).toBe(200);
      expect(rb.name).toBe(community.name);
      expect(rb.email).toBe(community.email);
    });
  });

  describe('PATCH /api/communities/:id', () => {
    let community: Community;

    beforeEach(async () => {
      await communityService.getModel().deleteMany({});
      community = await communitiesSeeder.seedCommunity({
        name: randomBytes(10).toString('hex'),
        hostname: 'test-community',
        creator: users[0].user.identityEthAddress,
        owners: [
          users[0].user.identityEthAddress,
          users[1].user.identityEthAddress,
        ],
        discordGuildId: 'kldakdsal',
        discordLinkNonce: randomBytes(10).toString('hex'),
        email: 'test@praise.io',
      });
    });
    const updateValidCommunity = async (override?: any) => {
      return authorizedPatchRequest(
        `/communities/${community._id}`,
        app,
        setupWebUserAccessToken,
        override,
      );
    };

    test('401 when not authenticated', async () => {
      return request(server)
        .patch(`/communities/${community._id}`)
        .send()
        .expect(401);
    });

    test('403 when user has wrong permissions', async () => {
      const response = await authorizedPatchRequest(
        `/communities/${community._id}`,
        app,
        users[0].accessToken,
        {
          name: 'test',
        },
      );

      expect(response.status).toBe(403);
    });

    test('400 when inputs are invalid', async () => {
      const response = await authorizedPatchRequest(
        `/communities/${community._id}`,
        app,
        setupWebUserAccessToken,
        {
          invalidField: 'test',
        },
      );

      expect(response.status).toBe(400);
    });

    // Name can only contain only alphanumeric characters, underscores, dots, and hyphen
    test('400 when name contains invalid characters, is not allowed to contain spaces', async () => {
      const response = await updateValidCommunity({ name: 'invalid name' });
      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Validation failed');
    });

    test('400 when name is too short', async () => {
      const response = await updateValidCommunity({ name: 'a' });
      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Validation failed');
    });

    test('400 when name is too long', async () => {
      const response = await updateValidCommunity({
        name: 'a'.repeat(200),
      });
      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Validation failed');
    });

    test('400 when name already exists', async () => {
      const newCommunity = await communitiesSeeder.seedCommunity({
        name: 'somename',
        hostname: 'some-community-givepraise-xyz',
        creator: users[0].user.identityEthAddress,
        owners: [
          users[0].user.identityEthAddress,
          users[1].user.identityEthAddress,
        ],
        discordGuildId: 'kldakdsal',
        discordLinkNonce: randomBytes(10).toString('hex'),
        email: 'test@praise.io',
      });
      const response = await updateValidCommunity({ name: newCommunity.name });
      expect(response.status).toBe(409);
      expect(response.body.message).toBe(
        `name '${newCommunity.name} 'already exists.`,
      );
    });

    test('400 when hostname is not a valid hostname', async () => {
      const response = await updateValidCommunity({ hostname: 'inva  lid' });
      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Validation failed');
    });

    test('400 when hostname already exists', async () => {
      await communitiesSeeder.seedCommunity({
        name: 'beefy',
        hostname: 'beefy.xyz',
        creator: users[0].user.identityEthAddress,
        owners: [
          users[0].user.identityEthAddress,
          users[1].user.identityEthAddress,
        ],
        discordGuildId: 'kldakdsal',
        discordLinkNonce: '223',
        email: 'test@praise.io',
      });
      const response = await updateValidCommunity({ hostname: 'beefy.xyz' });
      expect(response.status).toBe(409);
      expect(response.body.error).toBe('Duplicate key');
    });

    test('400 when attempting to change database', async () => {
      const response = await updateValidCommunity({ database: 'notallowed' });
      expect(response.status).toBe(400);
      expect(response.body.message[0]).toBe(
        'property database should not exist',
      );
    });

    test('400 when email is not a valid email', async () => {
      const response = await updateValidCommunity({ email: 'invalid' });
      expect(response.status).toBe(400);
      expect(response.body.message[0]).toBe('email must be an email');
    });

    test('400 when owners contains an invalid eth address', async () => {
      const response = await updateValidCommunity({
        owners: ['invalid', users[0].user.identityEthAddress],
      });
      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Validation failed');
    });

    test('400 when owners contains a duplicate eth address', async () => {
      const response = await updateValidCommunity({
        owners: [
          users[0].user.identityEthAddress,
          users[0].user.identityEthAddress,
        ],
      });
      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Validation failed');
    });

    test('400 when creator is not in owners', async () => {
      const response = await updateValidCommunity({
        owners: [users[1].user.identityEthAddress],
      });
      expect(response.status).toBe(400);
    });

    test('400 when owners contain invalid address', async () => {
      const response = await updateValidCommunity({
        owners: ['invalid', users[0].user.identityEthAddress],
      });
      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Validation failed');
    });

    test('200 when authenticated as setupWeb and correct data is sent', async () => {
      const newEmail = 'test1234@praise.io';
      const response = await updateValidCommunity({ email: newEmail });
      const rb = response.body;
      expect(response.status).toBe(200);
      expect(rb.email).toBe(newEmail);
    });
  });
});
