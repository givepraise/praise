import request from 'supertest';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { Server } from 'http';
import { Wallet } from 'ethers';
import { ServiceExceptionFilter } from '@/shared/filters/service-exception.filter';
import { UsersService } from '@/users/users.service';
import { UsersModule } from '@/users/users.module';
import { UsersSeeder } from '@/database/seeder/users.seeder';
import {
  authorizedPostRequest,
  loginUser,
} from './test.common';
import { runDbMigrations } from '@/database/migrations';
import { Praise } from '@/praise/schemas/praise.schema';
import { AuthRole } from '@/auth/enums/auth-role.enum';
import { User } from '@/users/schemas/users.schema';
import { MongoServerErrorFilter } from '@/shared/filters/mongo-server-error.filter';
import { MongoValidationErrorFilter } from '@/shared/filters/mongo-validation-error.filter';
import { CommunityService } from '../src/community/community.service';
import { CommunityModule } from '../src/community/community.module';

class LoggedInUser {
  accessToken: string;
  user: User;
  wallet: Wallet;
}

describe('Communities (E2E)', () => {
  let app: INestApplication;
  let server: Server;
  let module: TestingModule;
  let usersSeeder: UsersSeeder;
  let usersService: UsersService;
  let communityService: CommunityService;
  let setupWebUserAccessToken: string;

  const users: LoggedInUser[] = [];

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        AppModule,
        UsersModule,
        CommunityModule
      ],
      providers: [
        UsersSeeder,
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
    app.useGlobalFilters(new MongoServerErrorFilter());
    app.useGlobalFilters(new MongoValidationErrorFilter());
    app.useGlobalFilters(new ServiceExceptionFilter());
    server = app.getHttpServer();
    await app.init();
    await runDbMigrations(app);

    usersSeeder = module.get<UsersSeeder>(UsersSeeder);
    usersService = module.get<UsersService>(UsersService);

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
      const response = await loginUser(app, module, wallet);
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
      roles: [AuthRole.API_KEY_DISCORD_BOT],
    });

    const response = await loginUser(app, module, setupWebWallet);
    setupWebUserAccessToken = response.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/community', () => {

    beforeEach(async () => {

    });

    test('401 when not authenticated', async () => {
      return request(server).post(`/community`).send().expect(401);
    });

    test('403 when user has wrong permissions', async () => {
      const response = await authorizedPostRequest(
        `/community`,
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
        `/community`,
        app,
        setupWebUserAccessToken,
        {
          name: 'test',
        },
      );

      expect(response.status).toBe(400);
    });

    test('200 when authenticated as setupWeb and correct data is sent', async () => {
      const response = await authorizedPostRequest(
        `/community`,
        app,
        setupWebUserAccessToken,
        {
          name:'test',
          creator:users[0].wallet,
          owners:[users[0].wallet,users[1].wallet ],
          hostname:'test.praise.io',
          discordGuildId:'kldakdsal',
          email:'test@praise.io',
        },
      );

      const rb = response.body;

      expect(response.status).toBe(201);
      expect(rb.name).toBe('test');
      expect(rb.email).toBe('test@praise.io');
      expect(rb.isPublic).toBe(true);

    });

  });

});
