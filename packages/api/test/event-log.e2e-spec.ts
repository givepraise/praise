import './shared/jest';
import request from 'supertest';
import { Wallet } from 'ethers';
import { authorizedGetRequest, loginUser } from './shared/request';
import { EventLogType } from '../src/event-log/schemas/event-log-type.schema';
import { EventLog } from '../src/event-log/schemas/event-log.schema';

import {
  app,
  testingModule,
  server,
  usersSeeder,
  eventLogService,
  eventLogSeeder,
} from './shared/nest';

describe('EventLog (E2E)', () => {
  let wallet;
  let accessToken: string;

  beforeAll(async () => {
    // Seed the database
    wallet = Wallet.createRandom();
    await usersSeeder.seedUser({
      identityEthAddress: wallet.address,
      rewardsAddress: wallet.address,
    });

    // Login and get access token
    const response = await loginUser(app, testingModule, wallet);
    accessToken = response.accessToken;
  });

  describe('GET /api/event-log', () => {
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
      );

      expect(response.status).toBe(200);
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
