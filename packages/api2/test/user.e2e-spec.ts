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
import { authorizedRequest, loginUser } from './test.common';
import { User } from '@/users/schemas/users.schema';

describe('UserController (E2E)', () => {
  let app: INestApplication;
  let server: Server;
  let module: TestingModule;
  let usersSeeder: UsersSeeder;
  let usersService: UsersService;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [AppModule, UsersModule],
      providers: [UsersService, UsersSeeder],
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
      const response = await loginUser(app, wallet);
      accessToken = response.accessToken;
    });

    test('401 when not authenticated', async () => {
      return request(server).get('/users').send().expect(401);
    });

    test('200 when authenticated', async () => {
      await authorizedRequest('/users', app, accessToken).expect(200);
    });

    test('that returned user list matches seeded list', async () => {
      const response = await authorizedRequest(
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
        ).toBeTrue();
      }
    });
  });
});
