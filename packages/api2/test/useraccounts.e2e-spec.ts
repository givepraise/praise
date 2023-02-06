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
import { ServiceExceptionFilter } from '@/shared/service-exception.filter';
import { UsersService } from '@/users/users.service';
import { UsersModule } from '@/users/users.module';
import { UsersSeeder } from '@/database/seeder/users.seeder';
import { authorizedGetRequest, loginUser } from './test.common';
import { User } from '@/users/schemas/users.schema';
import { EventLogModule } from '@/event-log/event-log.module';
import { runDbMigrations } from '@/database/migrations';
import { AuthRole } from '@/auth/enums/auth-role.enum';
import { UserAccountsSeeder } from '@/database/seeder/useraccounts.seeder';
import { UserAccountsService } from '@/useraccounts/useraccounts.service';
import { UserAccount } from '@/useraccounts/schemas/useraccounts.schema';
import { UserAccountsModule } from '@/useraccounts/useraccounts.module';
import mongoose from 'mongoose';

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

  describe('GET /api/user_accounts/export', () => {
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

    test('401 when not authenticated', async () => {
      await request(server).get('/user_accounts/export').send().expect(401);
    });

    test('200 when authenticated', async () => {
      await authorizedGetRequest(
        '/user_accounts/export?format=json',
        app,
        accessToken,
      ).expect(200);
    });

    test('returns userAccounts list that matches seeded list in json format', async () => {
      const response = await authorizedGetRequest(
        '/user_accounts/export?format=json',
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
        '/user_accounts/export?format=csv',
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
