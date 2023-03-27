// Import modules related to authentication and users
import { User } from '../src/users/schemas/users.schema';
import { AuthRole } from '../src/auth/enums/auth-role.enum';
import { authorizedGetRequest, loginUser } from './shared/request';

// Import modules related to praise and quantifications
import { Praise } from '../src/praise/schemas/praise.schema';
import { Quantification } from '../src/quantifications/schemas/quantifications.schema';

// Import modules related to periods and status types
import { Period } from '../src/periods/schemas/periods.schema';
import { PeriodStatusType } from '../src/periods/enums/status-type.enum';

// Import Ethereum wallet related module
import { Wallet } from 'ethers';

// Import faker module
import { faker } from '@faker-js/faker';

import {
  app,
  testingModule,
  usersService,
  usersSeeder,
  praiseService,
  periodsSeeder,
  praiseSeeder,
  quantificationsSeeder,
  quantificationsService,
  userAccountsService,
  periodsService,
} from './shared/nest';

describe('UserAccountsController (E2E)', () => {
  let adminUser: User;
  let adminUserAccessToken: string;

  beforeAll(async () => {
    // Clear the database
    await usersService.getModel().deleteMany({});
    await praiseService.getModel().deleteMany({});
    await quantificationsService.getModel().deleteMany({});
    await userAccountsService.getModel().deleteMany({});
    await periodsService.getModel().deleteMany({});

    const wallet = Wallet.createRandom();
    adminUser = await usersSeeder.seedUser({
      identityEthAddress: wallet.address,
      rewardsAddress: wallet.address,
      roles: [AuthRole.ADMIN],
    });
    const response = await loginUser(app, testingModule, wallet);
    adminUserAccessToken = response.accessToken;
  });

  describe('GET /api/quantifications/export', () => {
    let praise: Praise;
    const praises: Praise[] = [];
    let startDate: Date;
    let endDate: Date;
    let dateBetween: Date;
    const quantifications: Quantification[] = [];
    let period: Period;

    beforeAll(async () => {
      // Clear the database
      await quantificationsService.getModel().deleteMany({});
      await praiseService.getModel().deleteMany();
      await periodsService.getModel().deleteMany();

      // Seed the database
      startDate = faker.date.past();
      dateBetween = faker.date.recent();
      endDate = faker.date.future();

      praise = await praiseSeeder.seedPraise({
        createdAt: endDate,
      });

      quantifications.push(
        await quantificationsSeeder.seedQuantification({
          quantifier: adminUser._id,
          score: 0,
          scoreRealized: 30,
          dismissed: false,
          praise: praise._id,
          createdAt: endDate,
        }),
      );

      praises.push(praise);

      praises.push(
        await praiseSeeder.seedPraise({
          createdAt: dateBetween,
        }),
      );

      quantifications.push(
        await quantificationsSeeder.seedQuantification({
          quantifier: adminUser._id,
          score: 0,
          scoreRealized: 20,
          dismissed: false,
          praise: praises[1]._id,
          createdAt: dateBetween,
        }),
      );

      praises.push(
        await praiseSeeder.seedPraise({
          createdAt: startDate,
        }),
      );

      quantifications.push(
        await quantificationsSeeder.seedQuantification({
          quantifier: adminUser._id,
          score: 0,
          scoreRealized: 10,
          dismissed: false,
          praise: praises[2]._id,
          createdAt: startDate,
        }),
      );

      await periodsSeeder.seedPeriod({
        endDate: praises[0].createdAt,
        status: PeriodStatusType.QUANTIFY,
      });

      await periodsSeeder.seedPeriod({
        endDate: praises[1].createdAt,
        status: PeriodStatusType.QUANTIFY,
      });

      period = await periodsSeeder.seedPeriod({
        endDate: praises[2].createdAt,
        status: PeriodStatusType.QUANTIFY,
      });
    });

    test('200 when authenticated', async () => {
      await authorizedGetRequest(
        `/quantifications/export?format=json&startDate=${dateBetween.toISOString()}&endDate=${endDate.toISOString()}`,
        app,
        adminUserAccessToken,
      ).expect(200);
    });

    test('400 when filtering by periodId and date range', async () => {
      const response = await authorizedGetRequest(
        `/quantifications/export?format=json&periodId=6348acd2e1a47ca32e79f46f&startDate=${dateBetween.toISOString()}&endDate=${endDate.toISOString()}`,
        app,
        adminUserAccessToken,
      ).expect(400);
      expect(response.body.code).toBe(1094);
    });

    test('returns quantification filtered by latest periodId', async () => {
      const response = await authorizedGetRequest(
        `/quantifications/export?format=json&periodId=${period._id}`,
        app,
        adminUserAccessToken,
      ).expect(200);
      expect(response.body.length).toBe(1);
      // toBeTrue() is not working with our version of jest
      // eslint-disable-next-line jest-extended/prefer-to-be-true
      expect(String(quantifications[2]._id) === response.body[0]._id).toBe(
        true,
      );
    });

    test('returns quantifications that matches seeded list in json format, filtered by date', async () => {
      const response = await authorizedGetRequest(
        `/quantifications/export?format=json&startDate=${dateBetween.toISOString()}&endDate=${endDate.toISOString()}`,
        app,
        adminUserAccessToken,
      ).expect(200);
      // exclude quantifications from the startDate
      expect(response.body.length).toBe(2);
      for (const returnedQuantification of response.body) {
        expect(
          quantifications.some(
            (createdQuantification) =>
              String(createdQuantification._id) !== returnedQuantification._id,
          ),
          // eslint-disable-next-line jest-extended/prefer-to-be-true
        ).toBe(true);
      }
    });

    test('returns quantifications that matches seeded list in csv format, filtered by date', async () => {
      const response = await authorizedGetRequest(
        `/quantifications/export?format=csv&startDate=${dateBetween.toISOString()}&endDate=${endDate.toISOString()}`,
        app,
        adminUserAccessToken,
      ).expect(200);
      expect(response.text).toBeDefined();
      expect(response.text).toContain('_id');
      expect(response.text).toContain(String(quantifications[0].praise));
      expect(response.text).toContain('score');
      expect(response.text).toContain('scoreRealized');
      expect(response.text).toContain('dismissed');
      // expect(response.text).toContain('duplicatePraise');
      expect(response.text).toContain('quantifier');
      expect(response.text).toContain('praise');
      expect(response.text).toContain('createdAt');
      expect(response.text).toContain('updatedAt');
    });
  });
});
