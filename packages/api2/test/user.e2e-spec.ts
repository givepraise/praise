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
  let usersService: UsersService;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [AppModule, UsersModule, EventLogModule],
      providers: [UsersSeeder],
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

      expect(response.body._id).toEqual(user._id.toString());

      expect(response.body).toMatchObject({
        _id: expect.any(String),
        identityEthAddress: expect.any(String),
        rewardsEthAddress: expect.any(String),
        username: expect.any(String),
        roles: expect.any(Array),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        accounts: expect.any(Array),
      });
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

    // TO DO 200 response containing user with multiple useraccounts

    // 200 response containing user with identityEthAddress is requesting user is ADMIN

    // 200 response containing user without useraccount, if user does not have any
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
      console.log(response);
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
      console.log(walletTestNExist);
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
      console.log(response);
      console.log(userTesNExistt._id);
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

    test('401 response if user not authenticated KRESO', async () => {
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
      ).expect(400);
      expect(response).toContain('Bad Request');
    });
  });
});
