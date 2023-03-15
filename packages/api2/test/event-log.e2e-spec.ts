import request from 'supertest';
import { Wallet } from 'ethers';
import { authorizedGetRequest, loginUser } from './test.common';
import { EventLogType } from '@/event-log/schemas/event-log-type.schema';
import { EventLog } from '@/event-log/schemas/event-log.schema';
import { StartNestReturn, startNest } from './shared/start-nest';

describe('EventLog (E2E)', () => {
  let wallet;
  let accessToken: string;
  let nest: StartNestReturn;

  beforeAll(async () => {
    nest = await startNest();

    // Seed the database
    wallet = Wallet.createRandom();
    await nest.usersSeeder.seedUser({
      identityEthAddress: wallet.address,
      rewardsAddress: wallet.address,
    });

    // Login and get access token
    const response = await loginUser(nest.app, nest.module, wallet);
    accessToken = response.accessToken;
  });

  afterAll(async () => {
    await nest.app.close();
  });

  describe('GET /api/event-log', () => {
    test('401 when not authenticated', async () => {
      return request(nest.server).get('/event-log').send().expect(401);
    });

    test('200 and correct body when authenticated', async () => {
      //Clear the database
      await nest.eventLogService.getModel().deleteMany({});

      // Seed the database with 12 event logs
      for (let i = 0; i < 12; i++) {
        await nest.eventLogSeeder.seedEventLog();
      }

      const response = await authorizedGetRequest(
        '/event-log?limit=10&page=1&sortColumn=createdAt&sortType=desc',
        nest.app,
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
      return request(nest.server).get('/event-log/types').send().expect(401);
    });

    test('200 and correct body when authenticated', async () => {
      const response = await authorizedGetRequest(
        '/event-log/types',
        nest.app,
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
