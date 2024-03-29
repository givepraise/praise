import './shared/jest';
import { Wallet } from 'ethers';
import request from 'supertest';
import {
  authorizedGetRequest,
  authorizedPostRequest,
  authorizedPatchRequest,
  loginUser,
} from './shared/request';
import { User } from '../src/users/schemas/users.schema';
import { faker } from '@faker-js/faker';
import { AuthRole } from '../src/auth/enums/auth-role.enum';
import { UserAccount } from '../src/useraccounts/schemas/useraccounts.schema';

import {
  app,
  server,
  usersService,
  usersSeeder,
  userAccountsSeeder,
  userAccountsService,
  testingModule,
} from './shared/nest';
import { Types } from 'mongoose';

describe('UserAccountsController (E2E)', () => {
  describe('POST /api/useraccounts', () => {
    let wallet;
    let accessToken: string;
    const users: User[] = [];

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
      const wallet2 = Wallet.createRandom();
      users.push(
        await usersSeeder.seedUser({
          identityEthAddress: wallet2.address,
          rewardsAddress: wallet2.address,
          roles: [AuthRole.USER],
        }),
      );

      // Login and get access token
      const response = await loginUser(app, testingModule, wallet);
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
          activateToken: 'token1234567890',
        },
      ).expect(201);

      expect(response.body).toBeDefined();
      expect(response.body.accountId).toEqual(String(users[0]._id));
      expect(response.body.name).toEqual(accountName);
      expect(response.body.platform).toEqual('DISCORD');
      expect(response.body.avatarId).toEqual(avatarId);
      expect(response.body.activateToken).toEqual('token1234567890');
      expect(response.body.user).toBeValidClass(User);
      expect(String(response.body.user._id)).toEqual(String(users[0]._id));
    });

    const createUserAccount = (override?: any) => {
      const defaultAccount = {
        accountId: faker.internet.mac(),
        name: faker.internet.userName().substring(0, 10),
        avatarId: faker.internet.url(),
        platform: 'DISCORD',
        user: String(users[0]._id),
      };
      return authorizedPostRequest('/useraccounts', app, accessToken, {
        ...defaultAccount,
        ...override,
      });
    };

    // Test with missing fields
    test('400 when missing fields', async () => {
      const response = await authorizedPostRequest(
        '/useraccounts',
        app,
        accessToken,
        {
          accountId: String(users[0]._id),
        },
      );
      expect(response.status).toBe(400);
    });

    // Test for duplicate account
    test('400 when account already exists', async () => {
      await createUserAccount();
      await createUserAccount().expect(400);
    });

    // Test for duplicate account
    test('201 when same account details and different platform', async () => {
      await createUserAccount();
      await createUserAccount({ platform: 'OTHER' }).expect(201);
    });

    // Test with invalid fields
    test('400 when invalid fields', async () => {
      const response = await authorizedPostRequest(
        `/useraccounts`,
        app,
        accessToken,
        {
          accountId: faker.internet.mac(),
          name: faker.internet.userName().substring(0, 10),
          avatarId: faker.internet.url(),
          platform: 'DISCORD',
          user: String(users[0]._id),
          invalidAttribute: 'invalid',
        },
      );

      expect(response.status).toBe(400);
    });

    // Fail if platform and accountId already exists
    test('400 when user account already exists for platform and account id', async () => {
      await createUserAccount({ accountId: '123456123456' });
      await createUserAccount({ accountId: '123456123456' }).expect(400);
    });

    // Fail if platform and name already exists
    test('400 when user account already exists for platform and name', async () => {
      await createUserAccount({ name: 'samename' });
      await createUserAccount({ name: 'samename' }).expect(400);
    });

    // Fail when user is not found
    test('400 when user is not found', async () => {
      createUserAccount({ user: new Types.ObjectId().toString() }).expect(400);
    });

    // Fail when user is invalid ObjectId
    test('400 when user is invalid ObjectId', async () => {
      createUserAccount({ user: 'invalid' }).expect(400);
    });

    // Fail when accountId is too short
    test('400 when accountId is too short', async () => {
      await createUserAccount({ accountId: '0' }).expect(400);
    });

    // Fail when accountId is too long
    test('400 when accountId is too long', async () => {
      await createUserAccount({ accountId: '0'.repeat(300) }).expect(400);
    });

    // Fail when name is too short
    test('400 when name is too short', async () => {
      await createUserAccount({ name: 'a' }).expect(400);
    });

    // Fail when name is too long
    test('400 when name is too long', async () => {
      await createUserAccount({ name: 'a'.repeat(35) }).expect(400);
    });

    // Fail when avatarId is too short
    test('400 when avatarId is too short', async () => {
      await createUserAccount({ avatarId: 'a' }).expect(400);
    });

    // Fail when avatarId is too long
    test('400 when avatarId is too long', async () => {
      await createUserAccount({ avatarId: 'a'.repeat(300) }).expect(400);
    });

    // Fail when platform is too short
    test('400 when platform is too short', async () => {
      await createUserAccount({ platform: 'a' }).expect(400);
    });

    // Fail when platform is too long
    test('400 when platform is too long', async () => {
      await createUserAccount({ platform: 'a'.repeat(300) }).expect(400);
    });
  });

  describe('PATCH /api/useraccounts', () => {
    let wallet;
    let accessToken: string;
    const users: User[] = [];
    const userAccounts: UserAccount[] = [];

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
      const response = await loginUser(app, testingModule, wallet);
      accessToken = response.accessToken;
    });

    beforeEach(async () => {
      // Clear the database
      await userAccountsService.getModel().deleteMany();
      userAccounts[0] = await userAccountsSeeder.seedUserAccount({
        user: users[0]._id,
      });
    });

    test('401 when not authenticated', async () => {
      await request(server)
        .patch(`/useraccounts/${userAccounts[0]._id}`)
        .send()
        .expect(401);
    });

    test('200 and correct path body when authenticated', async () => {
      const accountName = faker.internet.userName().substring(0, 10);
      const avatarId = faker.internet.url();
      const response = await authorizedPatchRequest(
        `/useraccounts/${userAccounts[0]._id}`,
        app,
        accessToken,
        {
          name: accountName,
          avatarId: avatarId,
          platform: 'DISCORD',
          activateToken: 'token09876token',
        },
      ).expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.accountId).toEqual(
        String(userAccounts[0].accountId),
      );
      expect(response.body.name).toEqual(accountName);
      expect(response.body.platform).toEqual('DISCORD');
      expect(response.body.avatarId).toEqual(avatarId);
      expect(response.body.activateToken).toEqual('token09876token');
      expect(response.body.user).toBeValidClass(User);
    });

    // Should not be allowed to delete a required field
    test('400 when deleting a required field', async () => {
      await authorizedPatchRequest(
        `/useraccounts/${userAccounts[0]._id}`,
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
        `/useraccounts/${userAccounts[0]._id}`,
        app,
        accessToken,
        {
          name: 'waytoolongnameforsuremorethan20characterstobehonest',
        },
      ).expect(400);
    });

    // Same platform and user should not be allowed
    test('400 when updating user to an existing one on the same platform', async () => {
      const ua = await userAccountsSeeder.seedUserAccount();
      await authorizedPatchRequest(
        `/useraccounts/${ua._id}`,
        app,
        accessToken,
        {
          user: users[0]._id.toString(),
        },
      ).expect(400);
    });

    // Same platform and account id should not be allowed
    test('400 when updating accountId to an existing one on the same platform', async () => {
      const ua = await userAccountsSeeder.seedUserAccount();
      await authorizedPatchRequest(
        `/useraccounts/${ua._id}`,
        app,
        accessToken,
        {
          accountId: userAccounts[0].accountId,
        },
      ).expect(400);
    });

    // Same platform and account id should not be allowed
    test('400 when updating accountId to an existing one on the same platform', async () => {
      const ua = await userAccountsSeeder.seedUserAccount();
      await authorizedPatchRequest(
        `/useraccounts/${ua._id}`,
        app,
        accessToken,
        {
          name: userAccounts[0].name,
        },
      ).expect(400);
    });
  });

  describe('GET /api/useraccounts', () => {
    let wallet;
    let accessToken: string;
    const users: User[] = [];
    const userAccounts: UserAccount[] = [];

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
      const response = await loginUser(app, testingModule, wallet);
      accessToken = response.accessToken;
    });

    test('401 when not authenticated', async () => {
      await request(server)
        .get(`/useraccounts?_id=${userAccounts[0]._id}`)
        .send()
        .expect(401);
    });

    test('200 when authenticated', async () => {
      const response = await authorizedGetRequest(
        `/useraccounts/${userAccounts[0]._id}`,
        app,
        accessToken,
      ).expect(200);
      expect(response.body).toBeDefined();
      expect(response.body._id).toEqual(String(userAccounts[0]._id));
      expect(response.body.accountId).toEqual(
        String(userAccounts[0].accountId),
      );
      expect(response.body.name).toEqual(userAccounts[0].name);
      expect(response.body.platform).toEqual(userAccounts[0].platform);
      expect(response.body.avatarId).toEqual(userAccounts[0].avatarId);
      expect(response.body.activateToken).toBeUndefined();
      expect(response.body).toBeProperlySerialized();
      expect(response.body).toBeValidClass(UserAccount);
    });

    test('200 find user account by accountId', async () => {
      const response = await authorizedGetRequest(
        `/useraccounts?accountId=${userAccounts[0].accountId}`,
        app,
        accessToken,
      );
      expect(response.status).toBe(200);
      expect(response.body[0]._id).toBe(String(userAccounts[0]._id));
      expect(response.body[0].activateToken).toBeUndefined();
    });

    test('200 and correct count when fetching multiple user accounts', async () => {
      await userAccountsSeeder.seedUserAccount({
        user: users[0]._id,
        platform: 'TWITTER',
      });
      await userAccountsSeeder.seedUserAccount({
        user: users[0]._id,
        platform: 'SLACK',
      });
      const response = await authorizedGetRequest(
        `/useraccounts?user=${users[0]._id}`,
        app,
        accessToken,
      ).expect(200);
      expect(response.body.length).toBe(3);
      for (const ua of response.body) {
        expect(ua).toBeProperlySerialized();
        expect(ua).toBeValidClass(UserAccount);
        expect(ua.activateToken).toBeUndefined();
      }
    });
  });

  describe('GET /api/useraccounts/export', () => {
    let wallet;
    let accessToken: string;
    const users: User[] = [];
    const userAccounts: UserAccount[] = [];

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
      const response = await loginUser(app, testingModule, wallet);
      accessToken = response.accessToken;
    });

    test('200 when authenticated', async () => {
      await authorizedGetRequest(
        '/useraccounts/export/json',
        app,
        accessToken,
      ).expect(200);
    });

    test('returns userAccounts list that matches seeded list in json format', async () => {
      const response = await authorizedGetRequest(
        '/useraccounts/export/json',
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
        '/useraccounts/export/csv',
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
