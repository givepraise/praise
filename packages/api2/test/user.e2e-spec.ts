import request from 'supertest';
import {
  ConsoleLogger,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { Server } from 'http';
import { Wallet } from 'ethers';
import { ServiceExceptionFilter } from '@/shared/filters/service-exception.filter';
import { UsersService } from '@/users/users.service';
import { UsersModule } from '@/users/users.module';
import { UsersSeeder } from '@/database/seeder/users.seeder';
import { UserAccountsSeeder } from '@/database/seeder/useraccounts.seeder';
import { UserAccountsService } from '@/useraccounts/useraccounts.service';
import { UserAccountsModule } from '@/useraccounts/useraccounts.module';
import { QuantificationsSeeder } from '@/database/seeder/quantifications.seeder';
import { QuantificationsService } from '@/quantifications/services/quantifications.service';
import { QuantificationsModule } from '@/quantifications/quantifications.module';
import { PraiseModule } from '@/praise/praise.module';
import { Praise } from '@/praise/schemas/praise.schema';
import { PraiseSeeder } from '@/database/seeder/praise.seeder';
import { PraiseService } from '@/praise/services/praise.service';
import { PeriodsSeeder } from '@/database/seeder/periods.seeder';
import { PeriodsModule } from '@/periods/periods.module';
import { PeriodsService } from '@/periods/services/periods.service';
import {
  authorizedGetRequest,
  authorizedPatchRequest,
  loginUser,
} from './test.common';
import { User } from '@/users/schemas/users.schema';
import { EventLogModule } from '@/event-log/event-log.module';
import { runDbMigrations } from '@/database/migrations';
import { AuthRole } from '@/auth/enums/auth-role.enum';
import { PeriodStatusType } from '@/periods/enums/status-type.enum';

describe('UserController (E2E)', () => {
  let app: INestApplication;
  let server: Server;
  let module: TestingModule;
  let usersSeeder: UsersSeeder;
  let usersService: UsersService;
  let userAccountsSeeder: UserAccountsSeeder;
  let userAccountsService: UserAccountsService;
  let praiseSeeder: PraiseSeeder;
  let praiseService: PraiseService;
  let periodsSeeder: PeriodsSeeder;
  let periodsService: PeriodsService;
  let quantificationsSeeder: QuantificationsSeeder;
  let quantificationsService: QuantificationsService;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        AppModule,
        UsersModule,
        EventLogModule,
        UserAccountsModule,
        PraiseModule,
        QuantificationsModule,
        PeriodsModule,
      ],
      providers: [
        UsersSeeder,
        UserAccountsSeeder,
        PraiseSeeder,
        QuantificationsSeeder,
        PeriodsSeeder,
      ],
    }).compile();
    app = module.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
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
    praiseSeeder = module.get<PraiseSeeder>(PraiseSeeder);
    praiseService = module.get<PraiseService>(PraiseService);
    quantificationsSeeder = module.get<QuantificationsSeeder>(
      QuantificationsSeeder,
    );
    quantificationsService = module.get<QuantificationsService>(
      QuantificationsService,
    );
    periodsSeeder = module.get<PeriodsSeeder>(PeriodsSeeder);
    periodsService = module.get<PeriodsService>(PeriodsService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/users/export', () => {
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
          roles: [AuthRole.ADMIN],
        }),
      );
      users.push(await usersSeeder.seedUser({}));

      // Login and get access token
      const response = await loginUser(app, module, wallet);
      accessToken = response.accessToken;
    });

    test('200 when authenticated', async () => {
      await authorizedGetRequest(
        '/users/export?format=json',
        app,
        accessToken,
      ).expect(200);
    });

    test('returns user list that matches seeded list in json format', async () => {
      const response = await authorizedGetRequest(
        '/users/export?format=json',
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
          // eslint-disable-next-line jest-extended/prefer-to-be-true
        ).toBe(true);
      }
    });

    test('returns user list that matches seeded list in csv format', async () => {
      const response = await authorizedGetRequest(
        '/users/export',
        app,
        accessToken,
      ).expect(200);
      expect(response.text).toBeDefined();
      expect(response.text).toContain(users[0].identityEthAddress);
      expect(response.text).toContain(users[1].identityEthAddress);
      expect(response.text).toContain('_id');
      expect(response.text).toContain('identityEthAddress');
      expect(response.text).toContain('rewardsEthAddress');
      expect(response.text).toContain('username');
      expect(response.text).toContain('roles');
      expect(response.text).toContain('createdAt');
      expect(response.text).toContain('updatedAt');
    });
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
      await request(server).get('/users').send().expect(401);
    });

    test('200 when authenticated', async () => {
      const response = await authorizedGetRequest(
        '/users',
        app,
        accessToken,
      ).expect(200);

      const u = response.body[0];
      expect(u).toBeProperlySerialized();
      expect(u).toBeValidClass(User);
    });

    test('that returned user list matches seeded list', async () => {
      const response = await authorizedGetRequest(
        '/users',
        app,
        accessToken,
      ).expect(200);

      const u = response.body;
      expect(u.length).toBe(users.length);

      for (const returnedUser of u) {
        expect(
          users.some(
            (user) =>
              user.identityEthAddress === returnedUser.identityEthAddress,
          ),
          // eslint-disable-next-line jest-extended/prefer-to-be-true
        ).toBe(true);
      }

      expect(u).toBeProperlySerialized();
      expect(u).toBeValidClass(User);
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

    test('400 response when trying to update not whitelisted fields', async () => {
      await authorizedPatchRequest(`/users/${user._id}`, app, accessToken, {
        identityEthAddress: '0x123',
      }).expect(400);
    });

    test('200 response with json body containing the user with useraccount', async () => {
      await userAccountsSeeder.seedUserAccount({
        user: user._id,
        platform: 'DISCORD',
      });

      await userAccountsSeeder.seedUserAccount({
        user: user._id,
        platform: 'DISCORD',
      });

      await userAccountsSeeder.seedUserAccount({
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

    test('200 response containing user with identityEthAddress is requesting user is ADMIN', async () => {
      const walletAdmin = Wallet.createRandom();
      await usersSeeder.seedUser({
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
      expect(response.body).toBeDefined();
      expect(response.body._id).toEqual(user._id.toString());
      expect(response.body.identityEthAddress).toEqual(user.identityEthAddress);
      expect(response.body.rewardsEthAddress).toEqual(user.rewardsEthAddress);
      expect(response.body.username).toEqual(user.username);
      expect(response.body.roles).toBeInstanceOf(Array);
      expect(response.body.roles).toContain('QUANTIFIER');
      expect(new Date(response.body.createdAt).toString()).not.toEqual(
        'Invalid Date',
      );
      expect(new Date(response.body.updatedAt).toString()).not.toEqual(
        'Invalid Date',
      );
      expect(response.body.accounts).toBeInstanceOf(Array);
    });

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

    test('403 response if user is not ADMIN', async () => {
      const walletTest = Wallet.createRandom();
      const userTest = await usersSeeder.seedUser({
        identityEthAddress: walletTest.address,
        rewardsAddress: walletTest.address,
        roles: [AuthRole.USER],
      });

      const responseUserTest = await loginUser(app, module, walletTest);
      const accessTokenTest = responseUserTest.accessToken;

      const response = await authorizedPatchRequest(
        `/users/${userTest._id}/addRole`,
        app,
        accessTokenTest,
        {
          role: 'QUANTIFIER',
        },
      ).expect(403);
      expect(response.body.error).toContain('Forbidden');
    });

    test('401 response if user not authenticated', async () => {
      const response = await authorizedPatchRequest(
        `/users/${user._id}/addRole`,
        app,
        '',
        {
          role: 'ADMIN',
        },
      ).expect(401);
      expect(response.body.message).toContain('Unauthorized');
    });
  });

  describe('PATCH /api/users/{id}/removeRole', () => {
    let wallet;
    let accessToken: string;
    let user: User;

    beforeAll(async () => {
      // Clear the database
      await usersService.getModel().deleteMany({});
      await periodsService.getModel().deleteMany({});
      await praiseService.getModel().deleteMany({});
      await quantificationsService.getModel().deleteMany({});

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

      expect(response.body).toBeDefined();
      expect(response.body._id).toEqual(user._id.toString());
      expect(response.body.identityEthAddress).toEqual(user.identityEthAddress);
      expect(response.body.rewardsEthAddress).toEqual(user.rewardsEthAddress);
      expect(response.body.username).toEqual(user.username);
      expect(response.body.roles).toBeInstanceOf(Array);
      expect(response.body.roles).not.toContain('QUANTIFIER');
      expect(response.body.roles).toContain('USER');
      expect(new Date(response.body.createdAt).toString()).not.toEqual(
        'Invalid Date',
      );
      expect(new Date(response.body.updatedAt).toString()).not.toEqual(
        'Invalid Date',
      );
      expect(response.body.accounts).toBeInstanceOf(Array);
    });

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
        roles: [AuthRole.USER],
      });

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

    test('400 response if removing QUANTIFIER role from actively assigned quantifier', async () => {
      const walletAdminActive = Wallet.createRandom();
      const userAdminActive = await usersSeeder.seedUser({
        identityEthAddress: walletAdminActive.address,
        rewardsAddress: walletAdminActive.address,
        roles: [AuthRole.USER, AuthRole.ADMIN, AuthRole.QUANTIFIER],
      });

      const responseAdminActive = await loginUser(
        app,
        module,
        walletAdminActive,
      );
      const accessTokenAdminActive = responseAdminActive.accessToken;

      const praise: Praise = await praiseSeeder.seedPraise();
      await quantificationsSeeder.seedQuantification({
        quantifier: userAdminActive._id,
        score: 0,
        scoreRealized: 0,
        dismissed: false,
        praise: praise._id,
      });
      await periodsSeeder.seedPeriod({
        endDate: praise.createdAt,
        status: PeriodStatusType.QUANTIFY,
      });

      const response = await authorizedPatchRequest(
        `/users/${userAdminActive._id}/removeRole`,
        app,
        accessTokenAdminActive,
        {
          role: 'QUANTIFIER',
        },
      ).expect(400);

      expect(response.body.error).toContain('Bad Request');
      expect(response.body.message).toContain(
        'Cannot remove quantifier currently assigned to quantification period',
      );
    });

    test('403 response if user is not admin', async () => {
      const walletTest = Wallet.createRandom();
      const userTest = await usersSeeder.seedUser({
        identityEthAddress: walletTest.address,
        rewardsAddress: walletTest.address,
        roles: [AuthRole.USER, AuthRole.QUANTIFIER],
      });

      const responseUserTest = await loginUser(app, module, walletTest);
      const accessTokenTest = responseUserTest.accessToken;

      const response = await authorizedPatchRequest(
        `/users/${userTest._id}/removeRole`,
        app,
        accessTokenTest,
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
        roles: [AuthRole.USER, AuthRole.ADMIN, AuthRole.QUANTIFIER],
      });

      const response = await authorizedPatchRequest(
        `/users/${userTestNotAuth._id}/removeRole`,
        app,
        '',
        {
          role: 'QUANTIFIER',
        },
      ).expect(401);
      expect(response.body.message).toContain('Unauthorized');
    });
  });
});
