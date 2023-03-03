import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { Wallet } from 'ethers';
import request from 'supertest';
import { ServiceExceptionFilter } from '@/shared/filters/service-exception.filter';
import { UsersService } from '@/users/users.service';
import { UsersModule } from '@/users/users.module';
import { UsersSeeder } from '@/database/seeder/users.seeder';
import {
  authorizedGetRequest,
  authorizedPostRequest,
  authorizedPatchRequest,
  loginUser,
} from './test.common';
import { User } from '@/users/schemas/users.schema';
import { faker } from '@faker-js/faker';
import { EventLogModule } from '@/event-log/event-log.module';
import { runDbMigrations } from '@/database/migrations';
import { AuthRole } from '@/auth/enums/auth-role.enum';
import { UserAccountsSeeder } from '@/database/seeder/useraccounts.seeder';
import { UserAccountsService } from '@/useraccounts/useraccounts.service';
import { UserAccount } from '@/useraccounts/schemas/useraccounts.schema';
import { UserAccountsModule } from '@/useraccounts/useraccounts.module';
import mongoose from 'mongoose';
import { Server } from 'http';
import { MongoServerErrorFilter } from '@/shared/filters/mongo-server-error.filter';
import { MongoValidationErrorFilter } from '@/shared/filters/mongo-validation-error.filter';

describe('UserAccountsController (E2E)', () => {
  let app: INestApplication;
  let server: Server;
  let module: TestingModule;
  let usersSeeder: UsersSeeder;
  let usersService: UsersService;
  let userAccountsSeeder: UserAccountsSeeder;
  let userAccountsService: UserAccountsService;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [AppModule, UsersModule, EventLogModule, UserAccountsModule],
      providers: [UsersSeeder, UserAccountsSeeder],
    }).compile();
    app = module.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
      }),
    );
    app.useGlobalFilters(new MongoServerErrorFilter());
    app.useGlobalFilters(new MongoValidationErrorFilter());
    app.useGlobalFilters(new ServiceExceptionFilter());
    server = app.getHttpServer();
    await app.init();
    await runDbMigrations(app);
    usersSeeder = module.get<UsersSeeder>(UsersSeeder);
    usersService = module.get<UsersService>(UsersService);
    userAccountsSeeder = module.get<UserAccountsSeeder>(UserAccountsSeeder);
    userAccountsService = module.get<UserAccountsService>(UserAccountsService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/useraccounts', () => {
    let wallet;
    let accessToken: string;
    const users: User[] = [];

    beforeAll((done) => {
      done();
    });

    afterAll((done) => {
      // Closing the DB connection allows Jest to exit successfully.
      mongoose.connection.close();
      done();
    });

    beforeAll(async () => {
      // Clear the database
      await usersService.getModel().deleteMany({});
      await userAccountsService.getModel().deleteMany();

      // Seed the database
      wallet = Wallet.createRandom();
      users.push(
        await usersSeeder.seedUser({
          identityEthAddress: wallet.address,
          rewardsAddress: wallet.address,
          roles: [AuthRole.ADMIN],
        }),
      );

      // Login and get access token
      const response = await loginUser(app, module, wallet);
      accessToken = response.accessToken;
    });

    test('401 when not authenticated', async () => {
      await request(server).post(`/useraccounts`).send().expect(401);
    });

    beforeEach(async () => {
      // Clear the database
      await userAccountsService.getModel().deleteMany();
    });

    test('201 and correct body when authenticated', async () => {
      const accountName = faker.internet.userName().substring(0, 10);
      const avatarId = faker.internet.url();
      const response = await authorizedPostRequest(
        '/useraccounts',
        app,
        accessToken,
        {
          accountId: String(users[0]._id),
          name: accountName,
          avatarId: avatarId,
          platform: 'DISCORD',
          user: String(users[0]._id),
        },
      );
      //.expect(201);

      expect(response.body).toBeDefined();
      expect(response.body.accountId).toEqual(String(users[0]._id));
      expect(response.body.name).toEqual(accountName);
      expect(response.body.platform).toEqual('DISCORD');
      expect(response.body.avatarId).toEqual(avatarId);
      expect(String(response.body.user)).toEqual(String(users[0]._id));
    });

    // Test for duplicate account
    test('409 when account already exists', async () => {
      await authorizedPostRequest('/useraccounts', app, accessToken, {
        accountId: String(users[0]._id),
        name: faker.internet.userName().substring(0, 10),
        avatarId: faker.internet.url(),
        platform: 'DISCORD',
        user: String(users[0]._id),
      });
      await authorizedPostRequest('/useraccounts', app, accessToken, {
        accountId: String(users[0]._id),
        name: faker.internet.userName().substring(0, 10),
        avatarId: faker.internet.url(),
        platform: 'DISCORD',
        user: String(users[0]._id),
      }).expect(409);
    });

    // Test with missing fields
    test('400 when missing fields', async () => {
      await authorizedPostRequest('/useraccounts', app, accessToken, {
        accountId: String(users[0]._id),
      }).expect(400);
    });

    // Test with invalid fields
    test('400 when invalid fields', async () => {
      await authorizedPostRequest('/useraccounts', app, accessToken, {
        accountId: String(users[0]._id),
        name: faker.internet.userName().substring(0, 10),
        avatarId: faker.internet.url(),
        platform: 'DISCORD',
        user: String(users[0]._id),
        invalidField: 'invalid',
      }).expect(400);
    });

    // One user account per platform and user
    test('409 when user account already exists for platform and user', async () => {
      await authorizedPostRequest('/useraccounts', app, accessToken, {
        accountId: '123456123456',
        name: faker.internet.userName().substring(0, 10),
        avatarId: faker.internet.url(),
        platform: 'DISCORD',
        user: String(users[0]._id),
      });
      await authorizedPostRequest('/useraccounts', app, accessToken, {
        accountId: '456779456779',
        name: faker.internet.userName().substring(0, 10),
        avatarId: faker.internet.url(),
        platform: 'DISCORD',
        user: String(users[0]._id), // Same user, same platform not allowed
      }).expect(409);
    });
  });

  describe('PATCH /api/useraccounts', () => {
    let wallet;
    let accessToken: string;
    const users: User[] = [];
    const userAccounts: UserAccount[] = [];

    beforeAll((done) => {
      done();
    });

    afterAll((done) => {
      // Closing the DB connection allows Jest to exit successfully.
      mongoose.connection.close();
      done();
    });

    beforeAll(async () => {
      // Clear the database
      await usersService.getModel().deleteMany({});
      await userAccountsService.getModel().deleteMany();

      // Seed the database
      wallet = Wallet.createRandom();
      users.push(
        await usersSeeder.seedUser({
          identityEthAddress: wallet.address,
          rewardsAddress: wallet.address,
          roles: [AuthRole.ADMIN],
        }),
      );

      // Login and get access token
      const response = await loginUser(app, module, wallet);
      accessToken = response.accessToken;
    });

    beforeEach(async () => {
      // Clear the database
      await userAccountsService.getModel().deleteMany();
      userAccounts[0] = await userAccountsSeeder.seedUserAccount({
        user: users[0]._id,
      });
    });

    // Should not allow both accountId and _id to be passed
    test('400 when both accountId and _id are passed', async () => {
      await authorizedPatchRequest(
        `/useraccounts?_id=${userAccounts[0]._id}&accountId=${userAccounts[0].accountId}`,
        app,
        accessToken,
        {
          name: faker.internet.userName().substring(0, 10),
          avatarId: faker.internet.url(),
          platform: 'DISCORD',
        },
      ).expect(400);
    });

    test('401 when not authenticated', async () => {
      await request(server)
        .patch(`/useraccounts?_id=${userAccounts[0]._id}`)
        .send()
        .expect(401);
    });

    test('200 and correct pat body when authenticated - use _id', async () => {
      const accountName = faker.internet.userName().substring(0, 10);
      const avatarId = faker.internet.url();
      const response = await authorizedPatchRequest(
        `/useraccounts?_id=${userAccounts[0]._id}`,
        app,
        accessToken,
        {
          name: accountName,
          avatarId: avatarId,
          platform: 'DISCORD',
        },
      );
      // .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.accountId).toEqual(
        String(userAccounts[0].accountId),
      );
      expect(response.body.name).toEqual(accountName);
      expect(response.body.platform).toEqual('DISCORD');
      expect(response.body.avatarId).toEqual(avatarId);
      expect(String(response.body.user)).toEqual(String(userAccounts[0].user));
    });

    test('200 and correct patch body when authenticated - use accountId', async () => {
      const accountName = faker.internet.userName().substring(0, 10);
      const avatarId = faker.internet.url();
      const response = await authorizedPatchRequest(
        `/useraccounts?accountId=${userAccounts[0].accountId}`,
        app,
        accessToken,
        {
          name: accountName,
          avatarId: avatarId,
          platform: 'FACEBOOK',
        },
      ).expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.accountId).toEqual(
        String(userAccounts[0].accountId),
      );
      expect(response.body.name).toEqual(accountName);
      expect(response.body.platform).toEqual('FACEBOOK');
      expect(response.body.avatarId).toEqual(avatarId);
      expect(String(response.body.user)).toEqual(String(userAccounts[0].user));
    });

    // Should not be allowed to delete a required field
    test('400 when deleting a required field', async () => {
      await authorizedPatchRequest(
        `/useraccounts?_id=${userAccounts[0]._id}`,
        app,
        accessToken,
        {
          name: null,
        },
      ).expect(400);
    });

    // Should not be allowed to update a field to an invalid value
    test('400 when updating a field to an invalid value', async () => {
      await authorizedPatchRequest(
        `/useraccounts?_id=${userAccounts[0]._id}`,
        app,
        accessToken,
        {
          name: 'waytoolongnameforsuremorethan20characterstobehonest',
        },
      ).expect(400);
    });

    // Should not be allowed to change accountId to an existing one
    test('409 when updating accountId to an existing one', async () => {
      const newAccount = await authorizedPostRequest(
        '/useraccounts',
        app,
        accessToken,
        {
          accountId: '123456123456',
          name: faker.internet.userName().substring(0, 10),
          avatarId: faker.internet.url(),
          platform: 'OTHERPLATFORM',
          user: String(users[0]._id),
        },
      );
      await authorizedPatchRequest(
        `/useraccounts?_id=${userAccounts[0]._id}`,
        app,
        accessToken,
        {
          accountId: newAccount.body.accountId,
        },
      ).expect(409);
    });

    // Should not be allowed to change platform to an existing one for a user that already has an account for that platform
    test('409 when updating platform to an existing one', async () => {
      const newAccount = await authorizedPostRequest(
        '/useraccounts',
        app,
        accessToken,
        {
          accountId: '123123123123',
          name: faker.internet.userName().substring(0, 10),
          avatarId: faker.internet.url(),
          platform: 'OTHERPLATFORM',
          user: String(users[0]._id),
        },
      );
      await authorizedPatchRequest(
        `/useraccounts?_id=${newAccount.body._id}`,
        app,
        accessToken,
        {
          platform: 'DISCORD',
        },
      ).expect(409);
    });
  });

  describe('GET /api/useraccounts?_id=xxxx&accountId=xxx', () => {
    let wallet;
    let accessToken: string;
    const users: User[] = [];
    const userAccounts: UserAccount[] = [];

    beforeAll((done) => {
      done();
    });

    afterAll((done) => {
      // Closing the DB connection allows Jest to exit successfully.
      mongoose.connection.close();
      done();
    });

    beforeAll(async () => {
      // Clear the database
      await usersService.getModel().deleteMany({});
      await userAccountsService.getModel().deleteMany();

      // Seed the database
      wallet = Wallet.createRandom();
      users.push(
        await usersSeeder.seedUser({
          identityEthAddress: wallet.address,
          rewardsAddress: wallet.address,
          roles: [AuthRole.ADMIN],
        }),
      );

      userAccounts.push(
        await userAccountsSeeder.seedUserAccount({ user: users[0]._id }),
      );

      // Login and get access token
      const response = await loginUser(app, module, wallet);
      accessToken = response.accessToken;
    });

    test('401 when not authenticated', async () => {
      await request(server)
        .get(`/useraccounts?_id=${userAccounts[0]._id}`)
        .send()
        .expect(401);
    });

    test('200 when authenticated', async () => {
      await authorizedGetRequest(
        `/useraccounts?_id=${userAccounts[0]._id}`,
        app,
        accessToken,
      ).expect(200);
    });

    test('returns the fetched user account by id', async () => {
      const response = await authorizedGetRequest(
        `/useraccounts?_id=${userAccounts[0]._id}`,
        app,
        accessToken,
      ).expect(200);
      expect(response.body._id).toBe(String(userAccounts[0]._id));
      expect(response.body.activateToken).toBeUndefined();
    });

    test('returns the fetched user account by account_id', async () => {
      const response = await authorizedGetRequest(
        `/useraccounts?accountId=${userAccounts[0].accountId}`,
        app,
        accessToken,
      ).expect(200);
      expect(response.body._id).toBe(String(userAccounts[0]._id));
      expect(response.body.activateToken).toBeUndefined();
    });
  });

  describe('GET /api/useraccounts/export', () => {
    let wallet;
    let accessToken: string;
    const users: User[] = [];
    const userAccounts: UserAccount[] = [];

    beforeAll((done) => {
      done();
    });

    afterAll((done) => {
      // Closing the DB connection allows Jest to exit successfully.
      mongoose.connection.close();
      done();
    });

    beforeAll(async () => {
      // Clear the database
      await usersService.getModel().deleteMany({});
      await userAccountsService.getModel().deleteMany();

      // Seed the database
      wallet = Wallet.createRandom();
      users.push(
        await usersSeeder.seedUser({
          identityEthAddress: wallet.address,
          rewardsAddress: wallet.address,
          roles: [AuthRole.ADMIN],
        }),
      );
      users.push(await usersSeeder.seedUser({}));

      userAccounts.push(
        await userAccountsSeeder.seedUserAccount({ user: users[0]._id }),
      );
      userAccounts.push(
        await userAccountsSeeder.seedUserAccount({ user: users[1]._id }),
      );

      // Login and get access token
      const response = await loginUser(app, module, wallet);
      accessToken = response.accessToken;
    });

    test('200 when authenticated', async () => {
      await authorizedGetRequest(
        '/useraccounts/export?format=json',
        app,
        accessToken,
      ).expect(200);
    });

    test('returns userAccounts list that matches seeded list in json format', async () => {
      const response = await authorizedGetRequest(
        '/useraccounts/export?format=json',
        app,
        accessToken,
      ).expect(200);
      expect(response.body.length).toBe(userAccounts.length);
      for (const returnedUser of response.body) {
        expect(
          userAccounts.some(
            (account) => String(account._id) === returnedUser._id,
          ),
          // eslint-disable-next-line jest-extended/prefer-to-be-true
        ).toBe(true);
      }
    });

    test('returns user list that matches seeded list in csv format', async () => {
      const response = await authorizedGetRequest(
        '/useraccounts/export?format=csv',
        app,
        accessToken,
      ).expect(200);
      expect(response.text).toBeDefined();
      expect(response.text).toContain(String(userAccounts[0]._id));
      expect(response.text).toContain('_id');
      expect(response.text).toContain('user');
      expect(response.text).toContain('accountId');
      expect(response.text).toContain('name');
      expect(response.text).toContain('avatarId');
      expect(response.text).toContain('platform');
      // expect(response.text).toContain('activateToken');
      expect(response.text).toContain('createdAt');
      expect(response.text).toContain('updatedAt');
    });
  });
});
