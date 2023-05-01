import './shared/jest';
import { Wallet } from 'ethers';
import request from 'supertest';
import { authorizedGetRequest, loginUser } from './shared/request';
import { User } from '../src/users/schemas/users.schema';
import { AuthRole } from '../src/auth/enums/auth-role.enum';

import {
  app,
  server,
  usersService,
  usersSeeder,
  userAccountsService,
  testingModule,
} from './shared/nest';

describe('ReportsController (E2E)', () => {
  describe('GET /api/reports', () => {
    let wallet;
    let accessToken: string;
    const users: User[] = [];

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

      // Login and get access token
      const response = await loginUser(app, testingModule, wallet);
      accessToken = response.accessToken;
    });

    test('401 when not authenticated', async () => {
      await request(server).get(`/reports`).send().expect(401);
    });

    beforeEach(async () => {
      // nothing yet
    });

    test('201 and correct body when authenticated', async () => {
      const response = await authorizedGetRequest('/reports', app, accessToken);
      expect(response.status).toBe(200);

      // Test if the response contains the expected report properties
      const report = response.body[0];
      expect(report).toHaveProperty('name');
      expect(report).toHaveProperty('displayName');
      expect(report).toHaveProperty('description');
      expect(report).toHaveProperty('configuration');
    });
  });
});
