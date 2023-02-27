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
import { authorizedGetRequest, loginUser } from './test.common';
import { EventLogSeeder } from '@/database/seeder/event-log.seeder';
import { EventLogModule } from '@/event-log/event-log.module';
import { EventLogService } from '@/event-log/event-log.service';
import { runDbMigrations } from '@/database/migrations';
import { EventLogType } from '@/event-log/schemas/event-log-type.schema';
import { EventLog } from '@/event-log/schemas/event-log.schema';
import { MongoServerErrorFilter } from '@/shared/filters/mongo-server-error.filter';
import { MongoValidationErrorFilter } from '@/shared/filters/mongo-validation-error.filter';

describe('EventLog (E2E)', () => {
  let app: INestApplication;
  let server: Server;
  let module: TestingModule;
  let usersSeeder: UsersSeeder;
  let usersService: UsersService;
  let eventLogSeeder: EventLogSeeder;
  let eventLogService: EventLogService;
  let wallet;
  let accessToken: string;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [AppModule, UsersModule, EventLogModule],
      providers: [UsersSeeder, EventLogSeeder],
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
    eventLogSeeder = module.get<EventLogSeeder>(EventLogSeeder);
    eventLogService = module.get<EventLogService>(EventLogService);

    // Clear the database
    await usersService.getModel().deleteMany({});

    // Seed the database
    wallet = Wallet.createRandom();
    await usersSeeder.seedUser({
      identityEthAddress: wallet.address,
      rewardsAddress: wallet.address,
    });

    // Login and get access token
    const response = await loginUser(app, module, wallet);
    accessToken = response.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/event-log', () => {
    test('401 when not authenticated', async () => {
      return request(server).get('/event-log').send().expect(401);
    });

    test('200 and correct body when authenticated', async () => {
      //Clear the database
      await eventLogService.getModel().deleteMany({});

      // Seed the database with 12 event logs
      for (let i = 0; i < 12; i++) {
        await eventLogSeeder.seedEventLog();
      }

      const response = await authorizedGetRequest(
        '/event-log?limit=10&page=1&sortColumn=createdAt&sortType=desc',
        app,
        accessToken,
      ).expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.docs).toBeDefined();
      expect(response.body.docs.length).toBe(10);
      expect(response.body.totalDocs).toBe(12);
      expect(response.body.page).toBe(1);
      expect(response.body.limit).toBe(10);
      expect(response.body.totalPages).toBe(2);

      const e = response.body.docs[0];
      expect(e).toBeProperlySerialized();
      expect(e).toBeValidClass(EventLog);
    });
  });

  describe('GET /api/event-log/types', () => {
    test('401 when not authenticated', async () => {
      return request(server).get('/event-log/types').send().expect(401);
    });

    test('200 and correct body when authenticated', async () => {
      const response = await authorizedGetRequest(
        '/event-log/types',
        app,
        accessToken,
      ).expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.length).toBeGreaterThan(0);

      const e = response.body[0];
      expect(e).toBeProperlySerialized();
      expect(e).toBeValidClass(EventLogType);
    });
  });
});
