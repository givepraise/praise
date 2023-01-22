import * as request from 'supertest';
import {
  ConsoleLogger,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { Server } from 'http';
import { Wallet } from 'ethers';
import { ServiceExceptionFilter } from '@/shared/service-exception.filter';
import { UsersService } from '@/users/users.service';
import { UsersModule } from '@/users/users.module';
import { UsersSeeder } from '@/database/seeder/users.seeder';
import { UserAccountsSeeder } from '@/database/seeder/useraccounts.seeder';
import { UserAccountsService } from '@/useraccounts/useraccounts.service';
import { UserAccountsModule } from '@/useraccounts/useraccounts.module';
import {
  authorizedGetRequest,
  authorizedPatchRequest,
  loginUser,
} from './test.common';
import { User } from '@/users/schemas/users.schema';
import { EventLogModule } from '@/event-log/event-log.module';
import { runDbMigrations } from '@/database/migrations';
import { AuthRole } from '@/auth/enums/auth-role.enum';

describe('UserController (E2E)', () => {
  let app: INestApplication;
  let server: Server;
  let module: TestingModule;
  let usersSeeder: UsersSeeder;
  let userAccountsSeeder: UserAccountsSeeder;
  let userAccountsService: UserAccountsService;
  let usersService: UsersService;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [AppModule, UsersModule, EventLogModule, UserAccountsModule],
      providers: [UsersSeeder, UserAccountsSeeder, UserAccountsService],
    }).compile();
    app = module.createNestApplication();
    app.useLogger(new ConsoleLogger());
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
      }),
    );
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

  describe('GET /api/users', () => {
    let wallet;
    let accessToken: string;
    const users: User[] = [];

    beforeAll(async () => {
      // Clear the database
      await usersService.getModel().deleteMany({});

      // Seed the database
      wallet = Wallet.createRandom();
      users.push(
        await usersSeeder.seedUser({
          identityEthAddress: wallet.address,
          rewardsAddress: wallet.address,
        }),
      );
      users.push(await usersSeeder.seedUser({}));

      // Login and get access token
      const response = await loginUser(app, module, wallet);
      accessToken = response.accessToken;
    });

    test('401 when not authenticated', async () => {
      return request(server).get('/users').send().expect(401);
    });

    test('200 when authenticated', async () => {
      await authorizedGetRequest('/users', app, accessToken).expect(200);
    });

    test('that returned user list matches seeded list', async () => {
      const response = await authorizedGetRequest(
        '/users',
        app,
        accessToken,
      ).expect(200);
      expect(response.body.length).toBe(users.length);
      for (const returnedUser of response.body) {
        expect(
          users.some(
            (user) =>
              user.identityEthAddress === returnedUser.identityEthAddress,
          ),
        ).toBe(true);
      }
    });
  });

  describe('GET /api/users/:id', () => {
    let wallet;
    let accessToken: string;
    let user: User;

    beforeAll(async () => {
      // Clear the database
      await usersService.getModel().deleteMany({});
      await userAccountsService.getModel().deleteMany({});

      // Seed the database
      wallet = Wallet.createRandom();
      user = await usersSeeder.seedUser({
        identityEthAddress: wallet.address,
        rewardsAddress: wallet.address,
      });

      // Login and get access token
      const response = await loginUser(app, module, wallet);
      accessToken = response.accessToken;
    });

    test('401 when not authenticated', async () => {
      return request(server).get(`/users/${user._id}`).send().expect(401);
    });

    test('400 when user not found', async () => {
      await authorizedGetRequest(
        '/users/5f9f1c1b9b9b9b9b9b9b9b9b',
        app,
        accessToken,
      ).expect(400);
    });

    test('200 when authenticated', async () => {
      const response = await authorizedGetRequest(
        `/users/${user._id}`,
        app,
        accessToken,
      ).expect(200);

      expect(response.body).toBeDefined();
      expect(response.body._id).toEqual(user._id.toString());
      expect(response.body.identityEthAddress).toEqual(user.identityEthAddress);
      expect(response.body.rewardsEthAddress).toEqual(user.rewardsEthAddress);
      expect(response.body.username).toEqual(user.username);
      expect(response.body.roles).toBeInstanceOf(Array);
      expect(new Date(response.body.createdAt).toString()).not.toEqual(
        'Invalid Date',
      );
      expect(new Date(response.body.updatedAt).toString()).not.toEqual(
        'Invalid Date',
      );
      expect(response.body.accounts).toBeInstanceOf(Array);
    });

    test('200 response with json body containing the user with userAccount', async () => {
      const userAccount = await userAccountsSeeder.seedUserAccount({
        user: user._id,
        platform: 'DISCORD',
      });

      const response = await authorizedGetRequest(
        `/users/${user._id}`,
        app,
        accessToken,
      ).expect(200);

      // Check User object
      expect(response.body).toBeDefined();
      expect(response.body._id).toEqual(user._id.toString());
      expect(response.body.identityEthAddress).toEqual(user.identityEthAddress);
      expect(response.body.rewardsEthAddress).toEqual(user.rewardsEthAddress);
      expect(response.body.username).toEqual(user.username);
      expect(response.body.roles).toBeInstanceOf(Array);
      expect(new Date(response.body.createdAt).toString()).not.toEqual(
        'Invalid Date',
      );
      expect(new Date(response.body.updatedAt).toString()).not.toEqual(
        'Invalid Date',
      );
      expect(response.body.accounts).toBeInstanceOf(Array);
      expect(typeof response.body.receivedTotalScore).toEqual('number');
      expect(typeof response.body.receivedTotalCount).toEqual('number');
      expect(typeof response.body.givenTotalScore).toEqual('number');
      expect(typeof response.body.givenTotalCount).toEqual('number');

      // Check UserAccount object
      expect(response.body.accounts[0]).toBeDefined();
      expect(response.body.accounts[0]._id).toEqual(userAccount._id.toString());
      expect(response.body.accounts[0].name).toEqual(userAccount.name);
      expect(response.body.accounts[0].avatarId).toEqual(userAccount.avatarId);
      expect(response.body.accounts[0].platform).toEqual(userAccount.platform);
      expect(
        new Date(response.body.accounts[0].createdAt).toString(),
      ).not.toEqual('Invalid Date');
      expect(
        new Date(response.body.accounts[0].updatedAt).toString(),
      ).not.toEqual('Invalid Date');
    });

    test('that returned user matches seeded user', async () => {
      const response = await authorizedGetRequest(
        `/users/${user._id}`,
        app,
        accessToken,
      ).expect(200);
      expect(response.body.identityEthAddress).toBe(user.identityEthAddress);
    });

    test('200 response of the updated user', async () => {
      const response = await authorizedPatchRequest(
        `/users/${user._id}`,
        app,
        accessToken,
        {
          username: 'newUsername',
        },
      ).expect(200);

      expect(response.body.username).toBe('newUsername');
    });

    test('200 response with json body containing the user with useraccount', async () => {
      const userAccountFirst = await userAccountsSeeder.seedUserAccount({
        user: user._id,
        platform: 'DISCORD',
      });

      const userAccountSecond = await userAccountsSeeder.seedUserAccount({
        user: user._id,
        platform: 'DISCORD',
      });

      const userAccountThird = await userAccountsSeeder.seedUserAccount({
        user: user._id,
        platform: 'DISCORD',
      });

      const response = await authorizedGetRequest(
        `/users/${user._id}`,
        app,
        accessToken,
      ).expect(200);

      expect(response.body.accounts[0]).toBeDefined();
      expect(response.body.accounts[1]).toBeDefined();
      expect(response.body.accounts[2]).toBeDefined();
    });

    test('200 response containing user with identityEthAddress is requesting user is ADMIN KRESO', async () => {
      const walletAdmin = Wallet.createRandom();
      const userAdmin = await usersSeeder.seedUser({
        identityEthAddress: walletAdmin.address,
        rewardsAddress: walletAdmin.address,
        roles: [AuthRole.USER, AuthRole.ADMIN],
      });

      const responseAdmin = await loginUser(app, module, walletAdmin);
      const accessTokenAdmin = responseAdmin.accessToken;

      const response = await authorizedGetRequest(
        `/users/${user._id}`,
        app,
        accessTokenAdmin,
      ).expect(200);

      expect(response.body.identityEthAddress).toBe(user.identityEthAddress);
    });
  });

  describe('PATCH /api/users/{id}/addRole', () => {
    let wallet;
    let accessToken: string;
    let user: User;

    beforeAll(async () => {
      // Clear the database
      await usersService.getModel().deleteMany({});

      // Seed the database
      wallet = Wallet.createRandom();
      user = await usersSeeder.seedUser({
        identityEthAddress: wallet.address,
        rewardsAddress: wallet.address,
        roles: [AuthRole.USER, AuthRole.ADMIN],
      });

      // Login and get access token
      const response = await loginUser(app, module, wallet);
      accessToken = response.accessToken;
    });

    test('400 when updateing user that does not exist', async () => {
      const response = await authorizedPatchRequest(
        `/users/gfdsgsy53hdfnrs5jndfshtrhtryhrt/addRole`,
        app,
        accessToken,
        {
          role: 'ADMIN',
        },
      ).expect(400);
      expect(response.body.error).toBe('Bad Request');
    });

    test('200 response of the updated user roles', async () => {
      const response = await authorizedPatchRequest(
        `/users/${user._id}/addRole`,
        app,
        accessToken,
        {
          role: 'QUANTIFIER',
        },
      ).expect(200);
      expect(response.body.roles).toContain('QUANTIFIER');
    });

    // 200 response with json body containing the updated user

    test('400 response if role does not exist', async () => {
      const response = await authorizedPatchRequest(
        `/users/${user._id}/addRole`,
        app,
        accessToken,
        {
          role: 'ROLE_THAT_NOT_EXIST',
        },
      ).expect(400);
      expect(response.body.error).toContain('Bad Request');
    });

    test('400 response if missing role parameter', async () => {
      const response = await authorizedPatchRequest(
        `/users/${user._id}/addRole`,
        app,
        accessToken,
        {},
      ).expect(400);
      expect(response.body.error).toContain('Bad Request');
    });

    test('400 response if user already has new role', async () => {
      const response = await authorizedPatchRequest(
        `/users/${user._id}/addRole`,
        app,
        accessToken,
        {
          role: 'ADMIN',
        },
      ).expect(400);
      expect(response.body.error).toContain('Bad Request');
    });

    test('403 response if user is not admin', async () => {
      /**
       * Can I here just use the user that is already seeded?
       * Just changing the role to USER?
       */

      const walletTest = Wallet.createRandom();
      const userTest = await usersSeeder.seedUser({
        identityEthAddress: walletTest.address,
        rewardsAddress: walletTest.address,
        roles: [AuthRole.USER],
      });

      // Login and get access token
      const responseUser = await loginUser(app, module, walletTest);
      accessToken = responseUser.accessToken;

      const response = await authorizedPatchRequest(
        `/users/${userTest._id}/addRole`,
        app,
        accessToken,
        {
          role: 'QUANTIFIER',
        },
      ).expect(403);
      expect(response.body.error).toContain('Forbidden');
    });

    /**
     * TO DO
     *
     * this test is not working, ask Kristofer for help.
     *
     * - who build the "addRole" function?
     * - check if the function is working properly
     *
     */
    test('401 response if user not authenticated', async () => {
      const walletTestNExist = Wallet.createRandom();
      const userTesNExistt = await usersSeeder.seedUser({
        identityEthAddress: walletTestNExist.address,
        rewardsAddress: walletTestNExist.address,
        roles: [AuthRole.USER],
      });

      const response = await authorizedPatchRequest(
        `/users/${userTesNExistt._id}/addRole`,
        app,
        accessToken,
        {
          role: 'ADMIN',
        },
      ).expect(200);
      expect(response).toContain('Bad Request');
    });
  });

  describe('PATCH /api/users/{id}/removeRole', () => {
    let wallet;
    let accessToken: string;
    let user: User;

    beforeAll(async () => {
      // Clear the database
      await usersService.getModel().deleteMany({});

      // Seed the database
      wallet = Wallet.createRandom();
      user = await usersSeeder.seedUser({
        identityEthAddress: wallet.address,
        rewardsAddress: wallet.address,
        roles: [AuthRole.USER, AuthRole.ADMIN, AuthRole.QUANTIFIER],
      });

      // Login and get access token
      const response = await loginUser(app, module, wallet);
      accessToken = response.accessToken;
    });

    test('200 response with json body containing the updated user', async () => {
      const response = await authorizedPatchRequest(
        `/users/${user._id}/removeRole`,
        app,
        accessToken,
        {
          role: 'QUANTIFIER',
        },
      ).expect(200);
      expect(response.body.roles).not.toContain('QUANTIFIER');
      expect(response.body.roles).toContain('USER');
    });

    // 200 response logs out updated user

    test('404 response if user does not exist', async () => {
      const response = await authorizedPatchRequest(
        `/users/dsagsdagdfbkdfj7fsaygds897afh9udshf/removeRole`,
        app,
        accessToken,
        {
          role: 'QUANTIFIER',
        },
      ).expect(400);
      expect(response.body.error).toContain('Bad Request');
    });

    test('400 response if role does not exist', async () => {
      const response = await authorizedPatchRequest(
        `/users/${user._id}/removeRole`,
        app,
        accessToken,
        {
          role: 'ROLE_THAT_NOT_EXIST',
        },
      ).expect(400);
      expect(response.body.error).toContain('Bad Request');
    });

    test('400 response if missing role parameter', async () => {
      const response = await authorizedPatchRequest(
        `/users/${user._id}/removeRole`,
        app,
        accessToken,
        {},
      ).expect(400);
      expect(response.body.error).toContain('Bad Request');
    });

    test('400 response if user does not have role', async () => {
      const walletTest = Wallet.createRandom();
      const userTest = await usersSeeder.seedUser({
        identityEthAddress: walletTest.address,
        rewardsAddress: walletTest.address,
        roles: [AuthRole.USER, AuthRole.ADMIN],
      });

      // Login and get access token
      const responseUser = await loginUser(app, module, walletTest);
      accessToken = responseUser.accessToken;

      const response = await authorizedPatchRequest(
        `/users/${userTest._id}/removeRole`,
        app,
        accessToken,
        {
          role: 'QUANTIFIER',
        },
      ).expect(400);
      expect(response.body.error).toContain('Bad Request');
    });

    test('400 response if removing ADMIN role from only ADMIN', async () => {
      const response = await authorizedPatchRequest(
        `/users/${user._id}/removeRole`,
        app,
        accessToken,
        {
          role: 'ADMIN',
        },
      ).expect(400);
      expect(response.body.error).toContain('Bad Request');
      expect(response.body.message).toContain(
        'It is not allowed to remove the last admin!',
      );
    });

    // 400 response if removing QUANTIFIER role from actively assigned quantifier

    test('403 response if user is not admin', async () => {
      /**
       * Can I here just use the user that is already seeded?
       * Just changing the role to USER?
       */

      const walletTest = Wallet.createRandom();
      const userTest = await usersSeeder.seedUser({
        identityEthAddress: walletTest.address,
        rewardsAddress: walletTest.address,
        roles: [AuthRole.USER, AuthRole.QUANTIFIER],
      });

      // Login and get access token
      const responseUser = await loginUser(app, module, walletTest);
      accessToken = responseUser.accessToken;

      const response = await authorizedPatchRequest(
        `/users/${userTest._id}/removeRole`,
        app,
        accessToken,
        {
          role: 'QUANTIFIER',
        },
      ).expect(403);
      expect(response.body.error).toContain('Forbidden');
    });

    test('401 response if user not authenticated', async () => {
      const walletTestNotAuth = Wallet.createRandom();
      const userTestNotAuth = await usersSeeder.seedUser({
        identityEthAddress: walletTestNotAuth.address,
        rewardsAddress: walletTestNotAuth.address,
        roles: [AuthRole.USER, AuthRole.QUANTIFIER],
      });

      const response = await authorizedPatchRequest(
        `/users/${userTestNotAuth._id}/removeRole`,
        app,
        accessToken,
        {
          role: 'QUANTIFIER',
        },
      ).expect(200);
      expect(response).toContain('Bad Request');
    });
  });
});
