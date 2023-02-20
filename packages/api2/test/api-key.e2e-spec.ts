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
import { UsersSeeder } from '@/database/seeder/users.seeder';
import {
  authorizedDeleteRequest,
  authorizedGetRequest,
  authorizedPostRequest,
  authorizedPutRequest,
  loginUser,
} from './test.common';
import { runDbMigrations } from '@/database/migrations';
import { ApiKeyService } from '@/api-key/api-key.service';
import { ApiKeyModule } from '@/api-key/api-key.module';
import { UsersModule } from '@/users/users.module';
import { AuthRole } from '@/auth/enums/auth-role.enum';

describe('EventLog (E2E)', () => {
  let app: INestApplication;
  let server: Server;
  let module: TestingModule;
  let usersSeeder: UsersSeeder;
  let apiKeyService: ApiKeyService;
  let wallet;
  let accessToken: string;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [AppModule, UsersModule, ApiKeyModule],
      providers: [UsersSeeder],
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
    apiKeyService = module.get<ApiKeyService>(ApiKeyService);

    // Seed the database
    wallet = Wallet.createRandom();
    await usersSeeder.seedUser({
      identityEthAddress: wallet.address,
      rewardsAddress: wallet.address,
      roles: [AuthRole.ADMIN],
    });

    // Login and get access token
    const response = await loginUser(app, module, wallet);
    accessToken = response.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/api-key - create API key', () => {
    test('401 when not authenticated', async () => {
      return request(server).post('/api-key').send().expect(401);
    });

    test('401 when wrong authentication', async () => {
      const wallet2 = Wallet.createRandom();
      await usersSeeder.seedUser({
        identityEthAddress: wallet2.address,
        rewardsAddress: wallet2.address,
        roles: [AuthRole.USER],
      });

      const response = await loginUser(app, module, wallet2);
      const accessToken2 = response.accessToken;

      await authorizedPostRequest('/api-key', app, accessToken2, {
        description: 'test key',
        role: AuthRole.APIKEY_READ,
      }).expect(403);
    });

    test('200 and correct body when authenticated', async () => {
      //Clear the database
      await apiKeyService.getModel().deleteMany({});

      const response = await authorizedPostRequest(
        '/api-key',
        app,
        accessToken,
        {
          description: 'test API key',
          role: AuthRole.APIKEY_READ,
        },
      ).expect(201);

      expect(response.body).toBeDefined();
      expect(response.body.description).toEqual('test API key');
      expect(response.body.role).toEqual(AuthRole.APIKEY_READ);
      expect(response.body.key).toBeDefined();
      expect(response.body.key).toHaveLength(64);
      expect(response.body.name).toEqual(response.body.key.slice(0, 8));
    });
  });

  describe('GET /api/api-key - List all API keys', () => {
    test('401 when not authenticated', async () => {
      return request(server).get('/api-key').send().expect(401);
    });

    test('200 and correct body when authenticated', async () => {
      //Clear the database
      await apiKeyService.getModel().deleteMany({});

      await authorizedPostRequest('/api-key', app, accessToken, {
        description: 'test API key',
        role: AuthRole.APIKEY_READ,
      });
      await authorizedPostRequest('/api-key', app, accessToken, {
        description: 'test API key 2',
        role: AuthRole.APIKEY_READ,
      });
      await authorizedPostRequest('/api-key', app, accessToken, {
        description: 'test API key 3',
        role: AuthRole.APIKEY_READ,
      });

      const response = await authorizedGetRequest(
        '/api-key',
        app,
        accessToken,
      ).expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.length).toEqual(3);
      expect(response.body[0].description).toEqual('test API key');
      expect(response.body[1].description).toEqual('test API key 2');
      expect(response.body[2].description).toEqual('test API key 3');
    });
  });

  describe('GET /api/api-key/{id} - Get one API key', () => {
    test('200 and correct body when authenticated', async () => {
      //Clear the database
      await apiKeyService.getModel().deleteMany({});

      const createResponse = await authorizedPostRequest(
        '/api-key',
        app,
        accessToken,
        {
          description: 'test API key',
          role: AuthRole.APIKEY_READ,
        },
      ).expect(201);

      const response = await authorizedGetRequest(
        `/api-key/${createResponse.body._id}`,
        app,
        accessToken,
      ).expect(200);

      expect(response.body).toBeDefined();
      expect(response.body._id).toEqual(createResponse.body._id);
    });
  });

  describe('PUT /api/api-key/{id} - Updated key description', () => {
    test('200 and correct body when authenticated', async () => {
      //Clear the database
      await apiKeyService.getModel().deleteMany({});

      const createResponse = await authorizedPostRequest(
        '/api-key',
        app,
        accessToken,
        {
          description: 'test API key',
          role: AuthRole.APIKEY_READ,
        },
      ).expect(201);

      const response = await authorizedPutRequest(
        `/api-key/${createResponse.body._id}`,
        app,
        accessToken,
        {
          description: 'updated description',
        },
      );

      expect(response.body).toBeDefined();
      expect(response.body._id).toEqual(createResponse.body._id);
      expect(response.body.description).toEqual('updated description');
    });
  });

  describe('DELETE /api/api-key/{id} - Revoke API key', () => {
    test('200 and correct body when authenticated', async () => {
      //Clear the database
      await apiKeyService.getModel().deleteMany({});

      const createResponse = await authorizedPostRequest(
        '/api-key',
        app,
        accessToken,
        {
          description: 'test API key',
          role: AuthRole.APIKEY_READ,
        },
      ).expect(201);

      const response = await authorizedDeleteRequest(
        `/api-key/${createResponse.body._id}`,
        app,
        accessToken,
      );

      expect(response.body).toBeDefined();
      expect(response.body._id).toEqual(createResponse.body._id);

      const getResponse = await authorizedGetRequest(
        `/api-key/${createResponse.body._id}`,
        app,
        accessToken,
      ).expect(400);

      expect(getResponse.body).toBeDefined();
      expect(getResponse.body.message).toEqual('Invalid API key ID');
    });
  });
});
