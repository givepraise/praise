import request from 'supertest';
import { Wallet } from 'ethers';
import {
  authorizedDeleteRequest,
  authorizedGetRequest,
  authorizedPostRequest,
  authorizedPutRequest,
  loginUser,
} from './test.common';
import { AuthRole } from '@/auth/enums/auth-role.enum';
import { ApiKey } from '@/api-key/schemas/api-key.schema';
import { StartNestReturn, startNest } from './shared/start-nest';

describe('EventLog (E2E)', () => {
  let adminWallet;
  let adminToken: string;
  let userWallet;
  let userToken: string;

  let nest: StartNestReturn;

  beforeAll(async () => {
    nest = await startNest();

    // Seed an admin user
    adminWallet = Wallet.createRandom();
    await nest.usersSeeder.seedUser({
      identityEthAddress: adminWallet.address,
      rewardsAddress: adminWallet.address,
      roles: [AuthRole.ADMIN],
    });

    // Login and get access token
    let response = await loginUser(nest.app, nest.module, adminWallet);
    adminToken = response.accessToken;

    // Seed a user
    userWallet = Wallet.createRandom();
    await nest.usersSeeder.seedUser({
      identityEthAddress: userWallet.address,
      rewardsAddress: userWallet.address,
      roles: [AuthRole.USER],
    });

    // Login and get access token
    response = await loginUser(nest.app, nest.module, userWallet);
    userToken = response.accessToken;
  });

  afterAll(async () => {
    await nest.app.close();
  });

  describe('POST /api/api-key - create API key', () => {
    beforeEach(async () => {
      //Clear the database
      await nest.apiKeyService.getModel().deleteMany({});
    });

    test('401 when not authenticated', async () => {
      return request(nest.server).post('/api-key').send().expect(401);
    });

    test('401 when wrong authentication', async () => {
      await authorizedPostRequest('/api-key', nest.app, userToken, {
        description: 'test key',
        role: AuthRole.API_KEY_READ,
      }).expect(403);
    });

    test('200 and correct body when authenticated', async () => {
      const response = await authorizedPostRequest(
        '/api-key',
        nest.app,
        adminToken,
        {
          description: 'test API key',
          role: AuthRole.API_KEY_READ,
        },
      ).expect(201);

      expect(response.body).toBeProperlySerialized();
      expect(response.body).toBeValidClass(ApiKey);
      expect(response.body.description).toEqual('test API key');
      expect(response.body.role).toEqual(AuthRole.API_KEY_READ);
      expect(response.body.key).toBeDefined();
      expect(response.body.key).toHaveLength(64);
      expect(response.body.name).toEqual(response.body.key.slice(0, 8));
    });

    test('400 when creating key with unallowed AuthRole', async () => {
      await authorizedPostRequest('/api-key', nest.app, adminToken, {
        description: 'test API key',
        role: AuthRole.ROOT,
      }).expect(400);
    });
  });

  describe('GET /api/api-key - List all API keys', () => {
    beforeEach(async () => {
      //Clear the database
      await nest.apiKeyService.getModel().deleteMany({});
    });

    test('401 when not authenticated', async () => {
      return request(nest.server).get('/api-key').send().expect(401);
    });

    test('200 and correct body when authenticated', async () => {
      await authorizedPostRequest('/api-key', nest.app, adminToken, {
        description: 'test API key',
        role: AuthRole.API_KEY_READ,
      });
      await authorizedPostRequest('/api-key', nest.app, adminToken, {
        description: 'test API key 2',
        role: AuthRole.API_KEY_READ,
      });
      await authorizedPostRequest('/api-key', nest.app, adminToken, {
        description: 'test API key 3',
        role: AuthRole.API_KEY_READ,
      });

      const response = await authorizedGetRequest(
        '/api-key',
        nest.app,
        adminToken,
      ).expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.length).toEqual(3);
      expect(response.body).toBeProperlySerialized();
      expect(response.body[0]).toBeValidClass(ApiKey);
      expect(response.body[0].description).toEqual('test API key');
      expect(response.body[1].description).toEqual('test API key 2');
      expect(response.body[2].description).toEqual('test API key 3');
    });
  });

  describe('GET /api/api-key/{id} - Get one API key', () => {
    beforeEach(async () => {
      //Clear the database
      await nest.apiKeyService.getModel().deleteMany({});
    });

    test('200 and correct body when authenticated', async () => {
      const createResponse = await authorizedPostRequest(
        '/api-key',
        nest.app,
        adminToken,
        {
          description: 'test API key',
          role: AuthRole.API_KEY_READ,
        },
      ).expect(201);

      const response = await authorizedGetRequest(
        `/api-key/${createResponse.body._id}`,
        nest.app,
        adminToken,
      ).expect(200);

      expect(response.body).toBeProperlySerialized();
      expect(response.body).toBeValidClass(ApiKey);
    });
  });

  describe('PUT /api/api-key/{id}', () => {
    beforeEach(async () => {
      //Clear the database
      await nest.apiKeyService.getModel().deleteMany({});
    });

    test('200 and correct body when changing description', async () => {
      const createResponse = await authorizedPostRequest(
        '/api-key',
        nest.app,
        adminToken,
        {
          description: 'test API key',
          role: AuthRole.API_KEY_READ,
        },
      ).expect(201);

      const response = await authorizedPutRequest(
        `/api-key/${createResponse.body._id}`,
        nest.app,
        adminToken,
        {
          description: 'updated description',
        },
      );

      expect(response.body).toBeProperlySerialized();
      expect(response.body).toBeValidClass(ApiKey);
      expect(response.body.description).toEqual('updated description');
    });

    test('400 when attempting to change AuthRole to unallowed role', async () => {
      const createResponse = await authorizedPostRequest(
        '/api-key',
        nest.app,
        adminToken,
        {
          description: 'test API key',
          role: AuthRole.API_KEY_READ,
        },
      ).expect(201);

      await authorizedPutRequest(
        `/api-key/${createResponse.body._id}`,
        nest.app,
        adminToken,
        {
          role: AuthRole.ROOT,
        },
      ).expect(400);
    });
  });

  describe('DELETE /api/api-key/{id} - Revoke API key', () => {
    beforeEach(async () => {
      //Clear the database
      await nest.apiKeyService.getModel().deleteMany({});
    });

    test('200 and correct body when authenticated', async () => {
      const createResponse = await authorizedPostRequest(
        '/api-key',
        nest.app,
        adminToken,
        {
          description: 'test API key',
          role: AuthRole.API_KEY_READ,
        },
      ).expect(201);

      const response = await authorizedDeleteRequest(
        `/api-key/${createResponse.body._id}`,
        nest.app,
        adminToken,
      );

      expect(response.body).toBeDefined();
      expect(response.body._id).toEqual(createResponse.body._id);

      const getResponse = await authorizedGetRequest(
        `/api-key/${createResponse.body._id}`,
        nest.app,
        adminToken,
      ).expect(400);

      expect(getResponse.body).toBeDefined();
      expect(getResponse.body.message).toEqual('API key not found');
    });

    test('400 when attempting to delete non-existing key', async () => {
      await authorizedDeleteRequest(
        `/api-key/123`,
        nest.app,
        adminToken,
      ).expect(400);
    });

    // Test that the key is actually revoked
    test('401 when using revoked key', async () => {
      const createResponse = await authorizedPostRequest(
        '/api-key',
        nest.app,
        adminToken,
        {
          description: 'test API key',
          role: AuthRole.API_KEY_READ,
        },
      ).expect(201);

      await authorizedDeleteRequest(
        `/api-key/${createResponse.body._id}`,
        nest.app,
        adminToken,
      ).expect(200);

      const response = await request(nest.server)
        .get('/api-key')
        .set('Authorization', `Bearer ${createResponse.body.key}`)
        .send()
        .expect(401);

      expect(response.body).toBeDefined();
      expect(response.body.message).toEqual('Unauthorized');
    });

    // Test should fail when attempting to delete key without proper authentication
    test('401 when attempting to delete key without proper authentication', async () => {
      const createResponse = await authorizedPostRequest(
        '/api-key',
        nest.app,
        adminToken,
        {
          description: 'test API key',
          role: AuthRole.API_KEY_READ,
        },
      ).expect(201);

      await authorizedDeleteRequest(
        `/api-key/${createResponse.body._id}`,
        nest.app,
        userToken,
      ).expect(403);
    });
  });
});
