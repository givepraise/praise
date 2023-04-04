// Import modules related to authentication and users
import { User } from '../src/users/schemas/users.schema';
import { AuthRole } from '../src/auth/enums/auth-role.enum';
import {
  authorizedGetRequest,
  authorizedPatchRequest,
  loginUser,
} from './shared/request';
import request from 'supertest';

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
import './shared/jest';

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
  periodSettingsSeeder,
  server,
  settingsSeeder,
  settingsService,
} from './shared/nest';
import { Types } from 'mongoose';
import { PeriodSetting } from '../src/settings/schemas/periodsettings.schema';
import { Setting } from '../src/settings/schemas/settings.schema';

class LoggedInUser {
  accessToken: string;
  user: User;
  wallet: Wallet;
}

describe('Quantifications (E2E)', () => {
  let adminUser: User;
  let adminUserAccessToken: string;

  const users: LoggedInUser[] = [];

  beforeAll(async () => {
    // Clear the database
    await usersService.getModel().deleteMany({});
    await praiseService.getModel().deleteMany({});
    await quantificationsService.getModel().deleteMany({});
    await userAccountsService.getModel().deleteMany({});
    await periodsService.getModel().deleteMany({});

    // Seed and login 3 users
    for (let i = 0; i < 3; i++) {
      const wallet = Wallet.createRandom();
      const user = await usersSeeder.seedUser({
        identityEthAddress: wallet.address,
        rewardsAddress: wallet.address,
        roles: [AuthRole.USER, AuthRole.QUANTIFIER],
      });
      const response = await loginUser(app, testingModule, wallet);
      users.push({
        accessToken: response.accessToken,
        user,
        wallet,
      });
    }

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

      await periodsSeeder.seedPeriod({
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

  describe('PUT /api/quantifications/{id}', () => {
    let praise: Praise;
    let period: Period;
    let setting: Setting;
    let periodSettingsAllowedValues: PeriodSetting;

    beforeEach(async () => {
      await praiseService.getModel().deleteMany({});
      await quantificationsService.getModel().deleteMany({});
      await settingsService.getSettingsModel().deleteMany({});
      await periodsService.getModel().deleteMany({});
      await settingsService.getPeriodSettingsModel().deleteMany({});

      praise = await praiseSeeder.seedPraise();

      await quantificationsSeeder.seedQuantification({
        quantifier: users[0].user._id,
        score: 0,
        scoreRealized: 0,
        dismissed: false,
        praise: praise._id,
      });

      period = await periodsSeeder.seedPeriod({
        endDate: praise.createdAt,
        status: PeriodStatusType.QUANTIFY,
      });

      setting = await settingsSeeder.seedSettings({
        key: 'PRAISE_QUANTIFY_ALLOWED_VALUES',
        value: '0, 1, 3, 5, 8, 13, 21, 34, 55, 89, 144',
        type: 'StringList',
      });

      periodSettingsAllowedValues =
        await periodSettingsSeeder.seedPeriodSettings({
          period: period,
          setting: setting,
          value: '0, 1, 3, 5, 8, 13, 21, 34, 55, 89, 144',
        });
    });

    test('401 when not authenticated', async () => {
      return request(server)
        .patch(`/quantifications/${praise._id}`)
        .send()
        .expect(401);
    });

    test('Invalid quantification parameters - no parameters', async () => {
      const response = await authorizedPatchRequest(
        `/quantifications/${praise._id}`,
        app,
        users[0].accessToken,
        {},
      );

      expect(response.status).toBe(400);
    });

    test('Invalid quantification parameters - score is string', async () => {
      const response = await authorizedPatchRequest(
        `/quantifications/${praise._id}`,
        app,
        users[0].accessToken,
        {
          score: 'string',
        },
      );

      expect(response.status).toBe(400);
    });

    test('Invalid quantification parameters - score is too large', async () => {
      const response = await authorizedPatchRequest(
        `/quantifications/${praise._id}`,
        app,
        users[0].accessToken,
        {
          // We added too big number intentionally to get validation error
          // eslint-disable-next-line @typescript-eslint/no-loss-of-precision
          score: 100098798798798798796897876897687698768,
        },
      );

      expect(response.status).toBe(400);
    });

    test('Invalid quantification parameters - duplicate is not booleans ', async () => {
      const response = await authorizedPatchRequest(
        `/quantifications/${praise._id}`,
        app,
        users[0].accessToken,
        {
          dismissed: 'string',
        },
      );

      expect(response.status).toBe(400);
    });

    test('200 and correct body when quantifying - single quantification', async () => {
      const response = await authorizedPatchRequest(
        `/quantifications/${praise._id}`,
        app,
        users[0].accessToken,
        {
          score: 144,
        },
      );

      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();

      const p = response.body[0] as Praise;
      expect(p._id).toBe(praise._id.toString());
      expect(p.score).toBe(144);
      expect(p.quantifications.length).toBe(1);
      expect(p.quantifications[0].score).toBe(144);
      expect(p.quantifications[0].scoreRealized).toBe(144);
      expect(p.quantifications[0].quantifier).toBe(
        users[0].user._id.toString(),
      );
      expect(p.quantifications[0].praise).toBe(praise._id.toString());
      expect(p.quantifications[0].dismissed).toBeFalsy();
      expect(p.quantifications[0].createdAt).toBeDefined();

      expect(p).toBeProperlySerialized();
      // expect(p).toBeValidClass(Praise);
    });

    test('400 when wrong score is sent', async () => {
      const response = await authorizedPatchRequest(
        `/quantifications/${praise._id}`,
        app,
        users[0].accessToken,
        {
          score: 666,
        },
      );

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(
        `Score 666 is not allowed. Allowed scores are: ${periodSettingsAllowedValues.value}`,
      );
      expect(response.body.error).toBe('Bad Request');
    });

    test('404 when praise does not exist', async () => {
      return authorizedPatchRequest(
        `/quantifications/${new Types.ObjectId()}`,
        app,
        users[0].accessToken,
        {
          score: 144,
        },
      ).expect(404);
    });

    test('400 when praise is not in quantify period', async () => {
      const praiseItem = await praiseSeeder.seedPraise({
        createdAt: faker.date.future(),
      });

      const response = await authorizedPatchRequest(
        `/quantifications/${praiseItem._id}`,
        app,
        users[0].accessToken,
        {
          score: 144,
        },
      );
      expect(response.statusCode).toBe(400);
    });

    test('400 when period in not in status QUANTIFY', async () => {
      const praiseItem = await praiseSeeder.seedPraise();

      await periodsSeeder.seedPeriod({
        endDate: praiseItem.createdAt,
        status: PeriodStatusType.OPEN,
      });

      return authorizedPatchRequest(
        `/quantifications/${praiseItem._id}`,
        app,
        users[0].accessToken,
        {
          score: 144,
        },
      ).expect(400);
    });

    test('400 when user is not quantifier', async () => {
      const walletAuth = Wallet.createRandom();
      const response = await loginUser(app, testingModule, walletAuth);
      const accessTokenAuth = response.accessToken;

      const praiseItem = await praiseSeeder.seedPraise();

      await periodsSeeder.seedPeriod({
        endDate: praise.createdAt,
        status: PeriodStatusType.QUANTIFY,
      });

      return authorizedPatchRequest(
        `/quantifications/${praiseItem._id}`,
        app,
        accessTokenAuth,
        {
          score: 144,
        },
      ).expect(403);
    });

    test('400 when praise is duplicate of itself', async () => {
      const praiseItem = await praiseSeeder.seedPraise();

      await periodsSeeder.seedPeriod({
        endDate: praise.createdAt,
        status: PeriodStatusType.QUANTIFY,
      });

      return authorizedPatchRequest(
        `/quantifications/${praiseItem._id}`,
        app,
        users[0].accessToken,
        {
          score: 144,
          duplicatepraise: praiseItem._id.toString(),
        },
      ).expect(400);
    });

    test('400 when duplicate praise item not found', async () => {
      const praiseItem = await praiseSeeder.seedPraise();

      await periodsSeeder.seedPeriod({
        endDate: praise.createdAt,
        status: PeriodStatusType.QUANTIFY,
      });

      return authorizedPatchRequest(
        `/quantifications/${praiseItem._id}`,
        app,
        users[0].accessToken,
        {
          score: 144,
          duplicatePraiseId: new Types.ObjectId().toString(),
        },
      ).expect(400);
    });

    test('400 when duplicate praise item is not in quantify period', async () => {
      const praiseItem = await praiseSeeder.seedPraise();

      await periodsSeeder.seedPeriod({
        endDate: praise.createdAt,
        status: PeriodStatusType.QUANTIFY,
      });

      const duplicatePraise = await praiseSeeder.seedPraise({
        createdAt: praise.createdAt.getDate() - 1,
      });

      return authorizedPatchRequest(
        `/quantifications/${praiseItem._id}`,
        app,
        users[0].accessToken,
        {
          score: 144,
          duplicatePraiseId: duplicatePraise._id.toString(),
        },
      ).expect(400);
    });

    test('400 when duplicate praise item is already quantified', async () => {
      const praiseItem = await praiseSeeder.seedPraise();

      await periodsSeeder.seedPeriod({
        endDate: praise.createdAt,
        status: PeriodStatusType.QUANTIFY,
      });

      const duplicatePraise = await praiseSeeder.seedPraise();

      await quantificationsSeeder.seedQuantification({
        quantifier: users[0].user._id,
        score: 0,
        scoreRealized: 0,
        dismissed: false,
        praise: duplicatePraise._id,
      });

      return authorizedPatchRequest(
        `/quantifications/${praiseItem._id}`,
        app,
        users[0].accessToken,
        {
          score: 144,
          duplicatePraiseId: duplicatePraise._id.toString(),
        },
      ).expect(400);
    });

    test('400 when praise marked duplicate of another duplicate', async () => {
      const praiseItem = await praiseSeeder.seedPraise();

      await periodsSeeder.seedPeriod({
        endDate: praise.createdAt,
        status: PeriodStatusType.QUANTIFY,
      });

      const duplicatePraise = await praiseSeeder.seedPraise();

      await quantificationsSeeder.seedQuantification({
        quantifier: users[0].user._id,
        score: 0,
        scoreRealized: 0,
        dismissed: false,
        praise: duplicatePraise._id,
        duplicatePraiseId: duplicatePraise._id.toString(),
      });

      return authorizedPatchRequest(
        `/quantifications/${praiseItem._id}`,
        app,
        users[0].accessToken,
        {
          score: 144,
          duplicatePraiseId: duplicatePraise._id.toString(),
        },
      ).expect(400);
    });

    test('400 when user is not assigned as quantifier for praise, but is quantifier for duplicate praise', async () => {
      const praiseItem = await praiseSeeder.seedPraise();

      await periodsSeeder.seedPeriod({
        endDate: praise.createdAt,
        status: PeriodStatusType.QUANTIFY,
      });

      const duplicatePraise = await praiseSeeder.seedPraise();

      await quantificationsSeeder.seedQuantification({
        quantifier: users[0].user._id,
        score: 0,
        scoreRealized: 0,
        dismissed: false,
        praise: duplicatePraise._id,
      });

      return authorizedPatchRequest(
        `/quantifications/${praiseItem._id}`,
        app,
        users[0].accessToken,
        {
          score: 144,
          duplicatePraiseId: duplicatePraise._id.toString(),
        },
      ).expect(400);
    });
  });

  describe('PATCH /api/quantifications/{id} - multiple quantifiers', () => {
    let praise: Praise;
    let period: Period;

    beforeEach(async () => {
      await praiseService.getModel().deleteMany({});
      await quantificationsService.getModel().deleteMany({});
      await settingsService.getSettingsModel().deleteMany({});
      await periodsService.getModel().deleteMany({});
      await settingsService.getPeriodSettingsModel().deleteMany({});

      praise = await praiseSeeder.seedPraise();

      // Seed three quantifications
      for (let i = 0; i < 3; i++) {
        await quantificationsSeeder.seedQuantification({
          quantifier: users[i].user._id,
          praise: praise._id,
        });
      }

      period = await periodsSeeder.seedPeriod({
        status: PeriodStatusType.QUANTIFY,
      });

      const allowedValuesSetting = await settingsSeeder.seedSettings({
        period: period,
        key: 'PRAISE_QUANTIFY_ALLOWED_VALUES',
        value: '0, 1, 3, 5, 8, 13, 21, 34, 55, 89, 144',
        type: 'StringList',
      });

      const praisePercentageSetting = await settingsSeeder.seedSettings({
        period: period,
        key: 'PRAISE_QUANTIFY_DUPLICATE_PRAISE_PERCENTAGE',
        value: '0.1',
        type: 'Float',
      });

      await periodSettingsSeeder.seedPeriodSettings({
        period: period,
        setting: allowedValuesSetting,
        value: '0, 1, 3, 5, 8, 13, 21, 34, 55, 89, 144',
      });
      await periodSettingsSeeder.seedPeriodSettings({
        period: period,
        setting: praisePercentageSetting,
        value: '0.1',
      });
    });

    test('Quantifying multiple praise - scores and averages correct', async () => {
      // Quantify, quantifier 1
      await authorizedPatchRequest(
        `/quantifications/${praise._id}`,
        app,
        users[0].accessToken,
        {
          score: 8,
        },
      );
      // Quantify, quantifier 2
      await authorizedPatchRequest(
        `/quantifications/${praise._id}`,
        app,
        users[1].accessToken,
        {
          score: 13,
        },
      );
      // Quantify, quantifier 3
      await authorizedPatchRequest(
        `/quantifications/${praise._id}`,
        app,
        users[2].accessToken,
        {
          score: 144,
        },
      );
      //
      const response = await authorizedGetRequest(
        `/praise/${praise._id}`,
        app,
        users[0].accessToken,
      );

      expect(response.status).toBe(200);

      const p = response.body as Praise;
      expect(p).toBeDefined();
      expect(p.quantifications.length).toBe(3);
      expect(p.score).toBe(55);

      expect(p).toBeProperlySerialized();
      // expect(p).toBeValidClass(Praise);
    });

    test('Quantifying multiple praise - scores and averages correct - with dismissed', async () => {
      // Quantify, quantifier 1
      await authorizedPatchRequest(
        `/quantifications/${praise._id}`,
        app,
        users[0].accessToken,
        {
          score: 8,
        },
      );
      // Quantify, quantifier 2
      await authorizedPatchRequest(
        `/quantifications/${praise._id}`,
        app,
        users[1].accessToken,
        {
          dismissed: true,
        },
      );
      // Quantify, quantifier 3
      await authorizedPatchRequest(
        `/quantifications/${praise._id}`,
        app,
        users[2].accessToken,
        {
          score: 144,
        },
      );

      const response = await authorizedGetRequest(
        `/praise/${praise._id}`,
        app,
        users[0].accessToken,
      );

      expect(response.status).toBe(200);

      const p = response.body as Praise;
      expect(p).toBeDefined();
      expect(p).toBeProperlySerialized();
      expect(p).toBeValidClass(Praise);
      expect(p.quantifications.length).toBe(3);
      expect(p.score).toBe(50.67);
    });

    test('Quantifying multiple praise - scores and averages correct - with duplicates and dismissed', async () => {
      // Quantify praise 1, quantifier 1
      await authorizedPatchRequest(
        `/quantifications/${praise._id}`,
        app,
        users[0].accessToken,
        {
          score: 8,
        },
      );

      // Quantify praise 1, quantifier 2
      await authorizedPatchRequest(
        `/quantifications/${praise._id}`,
        app,
        users[1].accessToken,
        {
          dismissed: true,
        },
      );
      // Quantify praise 1, quantifier 3
      await authorizedPatchRequest(
        `/quantifications/${praise._id}`,
        app,
        users[2].accessToken,
        {
          score: 144,
        },
      );

      // Seed another praise
      const praise2 = await praiseSeeder.seedPraise();

      // Seed three quantifications
      for (let i = 0; i < 3; i++) {
        await quantificationsSeeder.seedQuantification({
          quantifier: users[i].user._id,
          praise: praise2._id,
        });
      }

      // Quantify praise 2, quantifier 1
      await authorizedPatchRequest(
        `/quantifications/${praise2._id}`,
        app,
        users[0].accessToken,
        {
          score: 8,
        },
      );
      // Quantify praise 2, quantifier 2
      await authorizedPatchRequest(
        `/quantifications/${praise2._id}`,
        app,
        users[1].accessToken,
        {
          score: 13,
        },
      );
      // Quantify praise 2, quantifier 3¨
      // Mark as duplicate of praise 1
      await authorizedPatchRequest(
        `/quantifications/${praise2._id}`,
        app,
        users[2].accessToken,
        {
          duplicatePraise: praise._id,
        },
      );

      const response1 = await authorizedGetRequest(
        `/praise/${praise._id}`,
        app,
        users[0].accessToken,
      );

      const response2 = await authorizedGetRequest(
        `/praise/${praise2._id}`,
        app,
        users[0].accessToken,
      );

      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);

      const p1 = response1.body as Praise;
      const p2 = response2.body as Praise;

      expect(p1).toBeDefined();
      expect(p1).toBeProperlySerialized();
      expect(p1).toBeValidClass(Praise);
      expect(p1.quantifications.length).toBe(3);
      // (8+0+144)/3
      expect(p1.score).toBe(50.67);

      expect(p2).toBeDefined();
      expect(p2).toBeProperlySerialized();
      expect(p2).toBeValidClass(Praise);
      expect(p2.quantifications.length).toBe(3);
      // (8+13+14.4)/3
      expect(p2.score).toBe(11.8);
    });
  });

  describe('PATCH /api/quantifications/mulltiple', () => {
    let praise: Praise;
    let period: Period;

    beforeEach(async () => {
      await praiseService.getModel().deleteMany({});
      await quantificationsService.getModel().deleteMany({});
      await settingsService.getSettingsModel().deleteMany({});
      await periodsService.getModel().deleteMany({});
      await settingsService.getPeriodSettingsModel().deleteMany({});

      praise = await praiseSeeder.seedPraise();

      await quantificationsSeeder.seedQuantification({
        quantifier: users[0].user._id,
        score: 0,
        scoreRealized: 0,
        dismissed: false,
        praise: praise._id,
      });

      period = await periodsSeeder.seedPeriod({
        endDate: praise.createdAt,
        status: PeriodStatusType.QUANTIFY,
      });

      const setting = await settingsSeeder.seedSettings({
        key: 'PRAISE_QUANTIFY_ALLOWED_VALUES',
        value: '0, 1, 3, 5, 8, 13, 21, 34, 55, 89, 144',
        type: 'StringList',
      });

      await periodSettingsSeeder.seedPeriodSettings({
        period: period,
        setting: setting,
        value: '0, 1, 3, 5, 8, 13, 21, 34, 55, 89, 144',
      });
    });

    test('401 when not authenticated', async () => {
      return request(server)
        .patch(`/quantifications/multiple`)
        .send()
        .expect(401);
    });

    test('200 when correct data is sent', async () => {
      const praise2 = await praiseSeeder.seedPraise({
        createdAt: praise.createdAt,
      });

      await quantificationsSeeder.seedQuantification({
        quantifier: users[0].user._id,
        score: 0,
        scoreRealized: 0,
        dismissed: false,
        praise: praise2._id,
      });

      const response = await authorizedPatchRequest(
        `/quantifications/multiple`,
        app,
        users[0].accessToken,
        {
          praiseIds: [praise._id, praise2._id],
          params: {
            score: 144,
          },
        },
      );

      expect(response.status).toBe(200);

      const p = response.body as Praise[];
      expect(p).toBeProperlySerialized();
      // expect(p).toBeValidClass(Praise);
    });
  });
});
