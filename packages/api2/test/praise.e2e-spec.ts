import './shared/jest';
import request from 'supertest';
import { Wallet } from 'ethers';
import {
  authorizedGetRequest,
  authorizedPatchRequest,
  authorizedPostRequest,
  loginUser,
} from './shared/request';
import { Praise } from '@/praise/schemas/praise.schema';
import { Period } from '@/periods/schemas/periods.schema';
import { PeriodStatusType } from '@/periods/enums/status-type.enum';
import { PeriodSetting } from '@/periodsettings/schemas/periodsettings.schema';
import { PraisePaginatedQueryDto } from '@/praise/dto/praise-paginated-query.dto';
import { Types } from 'mongoose';
import { AuthRole } from '@/auth/enums/auth-role.enum';
import { User } from '@/users/schemas/users.schema';
import { Setting } from '@/settings/schemas/settings.schema';
import { faker } from '@faker-js/faker';

import {
  app,
  testingModule,
  server,
  usersService,
  usersSeeder,
  praiseService,
  periodsSeeder,
  praiseSeeder,
  quantificationsSeeder,
  userAccountsSeeder,
  settingsSeeder,
  quantificationsService,
  userAccountsService,
  periodSettingsService,
  periodsService,
  settingsService,
  periodSettingsSeeder,
} from './shared/nest';

class LoggedInUser {
  accessToken: string;
  user: User;
  wallet: Wallet;
}

describe('Praise (E2E)', () => {
  let adminUserAccessToken: string;
  let botUserAccessToken: string;

  const users: LoggedInUser[] = [];

  beforeAll(async () => {
    // Clear the database
    await usersService.getModel().deleteMany({});
    await praiseService.getModel().deleteMany({});
    await quantificationsService.getModel().deleteMany({});
    await userAccountsService.getModel().deleteMany({});
    await periodsService.getModel().deleteMany({});
    await periodSettingsService.getModel().deleteMany({});
    await settingsService.getModel().deleteMany({});

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

    // Seed and login admin user
    const wallet = Wallet.createRandom();
    await usersSeeder.seedUser({
      identityEthAddress: wallet.address,
      rewardsAddress: wallet.address,
      roles: [AuthRole.ADMIN],
    });

    const response = await loginUser(app, testingModule, wallet);
    adminUserAccessToken = response.accessToken;

    // Seed and login bot user
    const botWallet = Wallet.createRandom();
    await usersSeeder.seedUser({
      identityEthAddress: botWallet.address,
      rewardsAddress: botWallet.address,
      roles: [AuthRole.API_KEY_DISCORD_BOT],
    });

    const responseBot = await loginUser(app, testingModule, botWallet);
    botUserAccessToken = responseBot.accessToken;
  });

  describe('GET /api/praise/export', () => {
    let praise: Praise;
    const praises: Praise[] = [];
    let startDate: Date;
    let endDate: Date;
    let dateBetween: Date;
    let period: Period;

    beforeAll(async () => {
      // Clear the database
      await praiseService.getModel().deleteMany({});

      startDate = faker.date.past();
      dateBetween = faker.date.recent();
      endDate = faker.date.future();

      praise = await praiseSeeder.seedPraise({
        createdAt: endDate,
      });

      praises.push(praise);

      praises.push(
        await praiseSeeder.seedPraise({
          createdAt: dateBetween,
        }),
      );

      praises.push(
        await praiseSeeder.seedPraise({
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
        `/praise/export?format=json&startDate=${dateBetween.toISOString()}&endDate=${endDate.toISOString()}`,
        app,
        adminUserAccessToken,
      ).expect(200);
    });

    test('400 when filtering by periodId and date range', async () => {
      const response = await authorizedGetRequest(
        `/praise/export?format=json&periodId=6348acd2e1a47ca32e79f46f&startDate=${dateBetween.toISOString()}&endDate=${endDate.toISOString()}`,
        app,
        adminUserAccessToken,
      ).expect(400);
      expect(response.body.message).toBe(
        'Invalid date filtering option. When periodId is set, startDate and endDate should not be set.',
      );
    });

    test('returns quantification filtered by latest periodId', async () => {
      const response = await authorizedGetRequest(
        `/praise/export?format=json&periodId=${period._id}`,
        app,
        adminUserAccessToken,
      ).expect(200);

      expect(response.body.length).toBe(1);
      expect(String(praises[2]._id) === response.body[0]._id).toBeTruthy();
    });

    test('returns praises that matches seeded list in json format, filtered by date', async () => {
      const response = await authorizedGetRequest(
        `/praise/export?format=json&startDate=${dateBetween.toISOString()}&endDate=${endDate.toISOString()}`,
        app,
        adminUserAccessToken,
      ).expect(200);
      // exclude praise from startDate
      expect(response.body.length).toBe(2);
      for (const returnedPraise of response.body) {
        expect(
          praises.some(
            (createdPraise) => String(createdPraise._id) === returnedPraise._id,
          ),
          // eslint-disable-next-line jest-extended/prefer-to-be-true
        ).toBe(true);
      }
    });

    test('returns praises that matches seeded list in csv format, filtered by date', async () => {
      const response = await authorizedGetRequest(
        `/praise/export?format=csv&startDate=${dateBetween.toISOString()}&endDate=${endDate.toISOString()}`,
        app,
        adminUserAccessToken,
      ).expect(200);
      expect(response.text).toBeDefined();
      expect(response.text).toContain(praises[0].createdAt.toISOString());
      expect(response.text).toContain('_id');
      expect(response.text).toContain('reasonRaw');
      expect(response.text).toContain('reason');
      expect(response.text).toContain('sourceId');
      expect(response.text).toContain('sourceName');
      expect(response.text).toContain('score');
      expect(response.text).toContain('receiver');
      expect(response.text).toContain('giver');
      expect(response.text).toContain('forwarder');
      expect(response.text).toContain('createdAt');
      expect(response.text).toContain('updatedAt');
    });
  });

  describe('GET /api/praise', () => {
    let praise: Praise;

    beforeEach(async () => {
      praise = await praiseSeeder.seedPraise();

      await quantificationsSeeder.seedQuantification({
        quantifier: users[0].user._id,
        score: 0,
        scoreRealized: 0,
        dismissed: false,
        praise: praise._id,
      });

      await periodsSeeder.seedPeriod({
        endDate: praise.createdAt,
        status: PeriodStatusType.QUANTIFY,
      });
    });

    test('401 when not authenticated', async () => {
      return request(server).get('/praise').send().expect(401);
    });

    test('200 when correct data is sent', async () => {
      const response = await authorizedGetRequest(
        '/praise',
        app,
        users[0].accessToken,
      );
      expect(response.status).toBe(200);

      const p = response.body;
      expect(p).toBeProperlySerialized();
      // expect(p).toBeValidClass(Praise);
    });

    test('200 and should return the expected pagination object when called with query parameters', async () => {
      //Clear the database
      await praiseService.getModel().deleteMany({});

      const p: Praise[] = [];
      // Seed the database with 12 praise items
      for (let i = 0; i < 12; i++) {
        p.push(await praiseSeeder.seedPraise());
      }

      const options: PraisePaginatedQueryDto = {
        sortColumn: 'createdAt',
        sortType: 'asc',
        page: 1,
        limit: 10,
      };

      const urlParams = Object.entries(options)
        .map(([key, val]) => `${key}=${val}`)
        .join('&');

      const response = await authorizedGetRequest(
        `/praise?${urlParams}`,
        app,
        users[0].accessToken,
      ).expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.docs).toBeDefined();
      expect(response.body.docs.length).toBe(10);
      expect(response.body.totalDocs).toBe(12);
      expect(response.body.page).toBe(1);
      expect(response.body.limit).toBe(10);
      expect(response.body.totalPages).toBe(2);

      const praise = response.body.docs[0];
      const praise2 = p.find((x) => x._id.toString() === praise._id);
      expect(praise).toBeDefined();
      expect(praise2).toBeDefined();
      if (praise2) {
        expect(praise._id).toBe(praise2._id.toString());
        expect(praise.giver._id).toBe(praise2.giver.toString());
        expect(praise.receiver._id).toBe(praise2.receiver.toString());
        expect(praise.reason).toBe(praise2.reason);
        expect(praise.reasonRaw).toBe(praise2.reasonRaw);
        expect(praise.score).toBe(praise2.score);
        expect(praise.sourceId).toBe(praise2.sourceId);
        expect(praise.sourceName).toBe(praise2.sourceName);
      }

      expect(praise).toBeProperlySerialized();
      expect(praise).toBeValidClass(Praise);
    });
  });

  describe('GET /api/praise/{id}', () => {
    let praise: Praise;

    beforeEach(async () => {
      praise = await praiseSeeder.seedPraise();

      await quantificationsSeeder.seedQuantification({
        quantifier: users[0].user._id,
        score: 0,
        scoreRealized: 0,
        dismissed: false,
        praise: praise._id,
      });

      await periodsSeeder.seedPeriod({
        endDate: praise.createdAt,
        status: PeriodStatusType.QUANTIFY,
      });
    });

    test('401 when not authenticated', async () => {
      return request(server).get(`/praise/${praise._id}`).send().expect(401);
    });

    test('200 when correct data is sent', async () => {
      const response = await authorizedGetRequest(
        `/praise/${praise._id}`,
        app,
        users[0].accessToken,
      );

      expect(response.status).toBe(200);

      const p = response.body as Praise;
      expect(p).toBeDefined();
      expect(p._id).toBe(praise._id.toString());
      expect(p.giver._id).toBe(praise.giver.toString());
      expect(p.receiver._id).toBe(praise.receiver.toString());
      expect(p.reason).toBe(praise.reason);
      expect(p.reasonRaw).toBe(praise.reasonRaw);
      expect(p.score).toBe(praise.score);
      expect(p.sourceId).toBe(praise.sourceId);
      expect(p.sourceName).toBe(praise.sourceName);

      expect(p).toBeProperlySerialized();
      // expect(p).toBeValidClass(Praise);
    });

    test('400 when praise does not exist', async () => {
      return authorizedGetRequest(
        `/praise/${new Types.ObjectId()}`,
        app,
        users[0].accessToken,
      ).expect(400);
    });
  });

  describe('PUT /api/praise/{id}/quantify', () => {
    let praise: Praise;
    let period: Period;
    let setting: Setting;
    let periodSettingsAllowedValues: PeriodSetting;

    beforeEach(async () => {
      await praiseService.getModel().deleteMany({});
      await quantificationsService.getModel().deleteMany({});
      await settingsService.getModel().deleteMany({});
      await periodsService.getModel().deleteMany({});
      await periodSettingsService.getModel().deleteMany({});

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
        .patch(`/praise/${praise._id}/quantify`)
        .send()
        .expect(401);
    });

    test('Invalid quantification parameters - no parameters', async () => {
      const response = await authorizedPatchRequest(
        `/praise/${praise._id}/quantify`,
        app,
        users[0].accessToken,
        {},
      );

      expect(response.status).toBe(400);
    });

    test('Invalid quantification parameters - score is string', async () => {
      const response = await authorizedPatchRequest(
        `/praise/${praise._id}/quantify`,
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
        `/praise/${praise._id}/quantify`,
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
        `/praise/${praise._id}/quantify`,
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
        `/praise/${praise._id}/quantify`,
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
        `/praise/${praise._id}/quantify`,
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

    test('400 when praise does not exist', async () => {
      return authorizedPatchRequest(
        `/praise/${new Types.ObjectId()}/quantify`,
        app,
        users[0].accessToken,
        {
          score: 144,
        },
      ).expect(400);
    });

    test('400 when praise is not in quantify period', async () => {
      const praiseItem = await praiseSeeder.seedPraise();

      await periodsSeeder.seedPeriod({
        endDate: praise.createdAt.getDate() - 1,
        status: PeriodStatusType.QUANTIFY,
      });

      return authorizedPatchRequest(
        `/praise/${praiseItem._id}/quantify`,
        app,
        users[0].accessToken,
        {
          score: 144,
        },
      ).expect(400);
    });

    test('400 when period in not in status QUANTIFY', async () => {
      const praiseItem = await praiseSeeder.seedPraise();

      await periodsSeeder.seedPeriod({
        endDate: praiseItem.createdAt,
        status: PeriodStatusType.OPEN,
      });

      return authorizedPatchRequest(
        `/praise/${praiseItem._id}/quantify`,
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
        `/praise/${praiseItem._id}/quantify`,
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
        `/praise/${praiseItem._id}/quantify`,
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
        `/praise/${praiseItem._id}/quantify`,
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
        `/praise/${praiseItem._id}/quantify`,
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
        `/praise/${praiseItem._id}/quantify`,
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
        `/praise/${praiseItem._id}/quantify`,
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
        `/praise/${praiseItem._id}/quantify`,
        app,
        users[0].accessToken,
        {
          score: 144,
          duplicatePraiseId: duplicatePraise._id.toString(),
        },
      ).expect(400);
    });
  });

  describe('PUT /api/praise/{id}/quantify - multiple quantifiers', () => {
    let praise: Praise;
    let period: Period;

    beforeEach(async () => {
      await praiseService.getModel().deleteMany({});
      await quantificationsService.getModel().deleteMany({});
      await settingsService.getModel().deleteMany({});
      await periodsService.getModel().deleteMany({});
      await periodSettingsService.getModel().deleteMany({});

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
        `/praise/${praise._id}/quantify`,
        app,
        users[0].accessToken,
        {
          score: 8,
        },
      );
      // Quantify, quantifier 2
      await authorizedPatchRequest(
        `/praise/${praise._id}/quantify`,
        app,
        users[1].accessToken,
        {
          score: 13,
        },
      );
      // Quantify, quantifier 3
      await authorizedPatchRequest(
        `/praise/${praise._id}/quantify`,
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
      expect(p.quantifications.length).toBe(3);
      expect(p.score).toBe(55);

      expect(p).toBeProperlySerialized();
      // expect(p).toBeValidClass(Praise);
    });

    test('Quantifying multiple praise - scores and averages correct - with dismissed', async () => {
      // Quantify, quantifier 1
      await authorizedPatchRequest(
        `/praise/${praise._id}/quantify`,
        app,
        users[0].accessToken,
        {
          score: 8,
        },
      );
      // Quantify, quantifier 2
      await authorizedPatchRequest(
        `/praise/${praise._id}/quantify`,
        app,
        users[1].accessToken,
        {
          dismissed: true,
        },
      );
      // Quantify, quantifier 3
      await authorizedPatchRequest(
        `/praise/${praise._id}/quantify`,
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
        `/praise/${praise._id}/quantify`,
        app,
        users[0].accessToken,
        {
          score: 8,
        },
      );

      // Quantify praise 1, quantifier 2
      await authorizedPatchRequest(
        `/praise/${praise._id}/quantify`,
        app,
        users[1].accessToken,
        {
          dismissed: true,
        },
      );
      // Quantify praise 1, quantifier 3
      await authorizedPatchRequest(
        `/praise/${praise._id}/quantify`,
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
        `/praise/${praise2._id}/quantify`,
        app,
        users[0].accessToken,
        {
          score: 8,
        },
      );
      // Quantify praise 2, quantifier 2
      await authorizedPatchRequest(
        `/praise/${praise2._id}/quantify`,
        app,
        users[1].accessToken,
        {
          score: 13,
        },
      );
      // Quantify praise 2, quantifier 3¨
      // Mark as duplicate of praise 1
      await authorizedPatchRequest(
        `/praise/${praise2._id}/quantify`,
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

  describe('PUT /api/praise/quantify', () => {
    let praise: Praise;
    let period: Period;

    beforeEach(async () => {
      await praiseService.getModel().deleteMany({});
      await quantificationsService.getModel().deleteMany({});
      await settingsService.getModel().deleteMany({});
      await periodsService.getModel().deleteMany({});
      await periodSettingsService.getModel().deleteMany({});

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
      return request(server).patch(`/praise/quantify`).send().expect(401);
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
        `/praise/quantify`,
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

  describe('POST /api/praise - bot trying to create a praise item', () => {
    let period: Period;

    beforeEach(async () => {
      await praiseService.getModel().deleteMany({});
      await quantificationsService.getModel().deleteMany({});
      await settingsService.getModel().deleteMany({});
      await periodsService.getModel().deleteMany({});
      await periodSettingsService.getModel().deleteMany({});

      period = await periodsSeeder.seedPeriod({
        endDate: new Date(),
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

      await settingsSeeder.seedSettings({
        key: 'SELF_PRAISE_ALLOWED',
        value: false,
        type: 'Boolean',
      });

      await settingsSeeder.seedSettings({
        key: 'PRAISE_INVALID_RECEIVERS_ERROR',
        value: 'VALID RECEIVERS NOT MENTIONED',
        type: 'String',
      });

      await settingsSeeder.seedSettings({
        key: 'PRAISE_SUCCESS_MESSAGE',
        value: 'PRAISE SUCCESSFUL',
        type: 'String',
      });

      await settingsSeeder.seedSettings({
        key: 'FIRST_TIME_PRAISER',
        value: 'YOU ARE PRAISING FOR THE FIRST TIME. WELCOME TO PRAISE!',
        type: 'String',
      });
    });

    test('401 when not authenticated', async () => {
      return request(server).post(`/praise`).send().expect(401);
    });

    test('403 when user has wrong permissions', async () => {
      const response = await authorizedPostRequest(
        `/praise`,
        app,
        users[0].accessToken,
        {
          text: 'test',
        },
      );

      expect(response.status).toBe(403);
    });

    test('400 when inputs are invalid', async () => {
      const response = await authorizedPostRequest(
        `/praise`,
        app,
        botUserAccessToken,
        {
          text: 'test',
        },
      );

      expect(response.status).toBe(400);
    });

    test('200 when authenticated as bot and correct data is sent', async () => {
      const receiverIds = [];
      for (let i = 0; i < 3; i++) {
        const user = await userAccountsSeeder.seedUserAccount();
        receiverIds.push(user.accountId);
      }

      const giver = await userAccountsSeeder.seedUserAccount();

      const response = await authorizedPostRequest(
        `/praise`,
        app,
        botUserAccessToken,
        {
          reason: 'This is a test reason',
          reasonRaw: 'This is a test reason',
          giver: {
            accountId: giver.accountId,
            name: giver.name,
            avatarId: giver.avatarId,
            platform: giver.platform,
          },
          receiverIds: receiverIds,
          sourceId: 'DISCORD:GUILD_ID:CHANNEL_ID',
          sourceName: 'DISCORD:GUILD_NAME:CHANNEL_NAME',
        },
      );

      const rb = response.body;

      expect(response.status).toBe(201);
      expect(rb).toBeInstanceOf(Array);
      expect(rb).toHaveLength(3);

      expect(rb[0]).toBeValidClass(Praise);
      expect(rb[0]).toBeProperlySerialized();
    });

    // test, API should return 400 when praise reason contains more than 280 characters
    test('400 when reason is more than 280 characters', async () => {
      const giver = await userAccountsSeeder.seedUserAccount();
      const receiver = await userAccountsSeeder.seedUserAccount();

      const reason = faker.lorem.sentence(300);
      const reasonRaw = faker.lorem.sentence(300);

      const response = await authorizedPostRequest(
        `/praise`,
        app,
        botUserAccessToken,
        {
          reason: reason,
          reasonRaw: reasonRaw,
          giver: {
            accountId: giver.accountId,
            name: giver.name,
            avatarId: giver.avatarId,
            platform: giver.platform,
          },
          receiverIds: [receiver.accountId],
          sourceId: 'DISCORD:GUILD_ID:CHANNEL_ID',
          sourceName: 'DISCORD:GUILD_NAME:CHANNEL_NAME',
        },
      );

      expect(response.status).toBe(400);
      expect(response.body.message).toContain(
        'reason must be shorter than or equal to 280 characters',
      );
      expect(response.body.message).toContain(
        'reasonRaw must be shorter than or equal to 280 characters',
      );
    });

    test('400 when sourceId is more than 100 characters', async () => {
      const giver = await userAccountsSeeder.seedUserAccount();
      const receiver = await userAccountsSeeder.seedUserAccount();

      const sourceId = faker.lorem.sentence(200);

      const response = await authorizedPostRequest(
        `/praise`,

        app,
        botUserAccessToken,
        {
          reason: 'This is a test reason',
          reasonRaw: 'This is a test reason',
          giver: {
            accountId: giver.accountId,
            name: giver.name,
            avatarId: giver.avatarId,
            platform: giver.platform,
          },
          receiverIds: [receiver.accountId],
          sourceId: sourceId,
          sourceName: 'DISCORD:GUILD_NAME:CHANNEL_NAME',
        },
      );

      expect(response.status).toBe(400);
      expect(response.body.message).toContain(
        'sourceId must be shorter than or equal to 100 characters',
      );
    });

    test('400 when sourceName is more than 100 characters', async () => {
      const giver = await userAccountsSeeder.seedUserAccount();
      const receiver = await userAccountsSeeder.seedUserAccount();

      const sourceName = faker.lorem.sentence(200);

      const response = await authorizedPostRequest(
        `/praise`,
        app,
        botUserAccessToken,
        {
          reason: 'This is a test reason',
          reasonRaw: 'This is a test reason',
          giver: {
            accountId: giver.accountId,
            name: giver.name,
            avatarId: giver.avatarId,
            platform: giver.platform,
          },
          receiverIds: [receiver.accountId],
          sourceId: 'DISCORD:GUILD_ID:CHANNEL_ID',
          sourceName: sourceName,
        },
      );

      expect(response.status).toBe(400);
      expect(response.body.message).toContain(
        'sourceName must be shorter than or equal to 100 characters',
      );
    });

    test('400 when giver account is not activated', async () => {
      const receiverIds = [];
      for (let i = 0; i < 3; i++) {
        const user = await userAccountsSeeder.seedUserAccount();
        receiverIds.push(user.accountId);
      }

      const giver = await userAccountsSeeder.seedUserAccount({
        user: null,
      });

      const response = await authorizedPostRequest(
        `/praise`,
        app,
        botUserAccessToken,
        {
          reason: 'This is a test reason',
          reasonRaw: 'This is a test reason',
          giver: {
            accountId: giver.accountId,
            name: giver.name,
            avatarId: giver.avatarId,
            platform: giver.platform,
            user: null,
          },
          receiverIds: receiverIds,
          sourceId: 'DISCORD:GUILD_ID:CHANNEL_ID',
          sourceName: 'DISCORD:GUILD_NAME:CHANNEL_NAME',
        },
      );

      expect(response.status).toBe(400);
      expect(response.body.message).toContain(
        'giver.() is not a valid ObjectId.',
      );
    });

    test('400 when giver is not activated', async () => {
      const receiverIds = [];
      for (let i = 0; i < 3; i++) {
        const user = await userAccountsSeeder.seedUserAccount();
        receiverIds.push(user.accountId);
      }

      const giver = await userAccountsSeeder.seedUserAccount({
        user: null,
      });

      const response = await authorizedPostRequest(
        `/praise`,
        app,
        botUserAccessToken,
        {
          reason: 'This is a test reason',
          reasonRaw: 'This is a test reason',
          giver: {
            accountId: giver.accountId,
            name: giver.name,
            avatarId: giver.avatarId,
            platform: giver.platform,
            user: null,
          },
          receiverIds: receiverIds,
          sourceId: 'DISCORD:GUILD_ID:CHANNEL_ID',
          sourceName: 'DISCORD:GUILD_NAME:CHANNEL_NAME',
        },
      );

      expect(response.status).toBe(400);
      expect(response.body.message[0]).toBe(
        'giver.() is not a valid ObjectId.',
      );
    });

    test('400 when receiver ids are not sent', async () => {
      const giver = await userAccountsSeeder.seedUserAccount();

      const response = await authorizedPostRequest(
        `/praise`,
        app,
        botUserAccessToken,
        {
          reason: 'This is a test reason',
          reasonRaw: 'This is a test reason',
          giver: {
            accountId: giver.accountId,
            name: giver.name,
            avatarId: giver.avatarId,
            platform: giver.platform,
          },
          sourceId: 'DISCORD:GUILD_ID:CHANNEL_ID',
          sourceName: 'DISCORD:GUILD_NAME:CHANNEL_NAME',
          receiverIds: [],
        },
      );

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('No receivers specified');
    });

    test('400 with validation errors when data is missing', async () => {
      const response = await authorizedPostRequest(
        `/praise`,
        app,
        botUserAccessToken,
        {
          invalidAttribute: 'test',
        },
      );

      expect(response.status).toBe(400);
      const rb = response.body;

      expect(rb.message).toContain(
        'property invalidAttribute should not exist',
      );
      expect(rb.message).toContain('reason must be a string');
      expect(rb.message).toContain('reasonRaw must be a string');
      expect(rb.message).toContain('receiverIds should not be empty');
      expect(rb.message).toContain('giver should not be empty');
      expect(rb.message).toContain('sourceId must be a string');
      expect(rb.message).toContain('sourceName must be a string');
    });

    test('400 when wrong giver data is send', async () => {
      const receiverIds = [];
      for (let i = 0; i < 3; i++) {
        const user = await userAccountsSeeder.seedUserAccount();
        receiverIds.push(user.accountId);
      }

      const response = await authorizedPostRequest(
        `/praise`,
        app,
        botUserAccessToken,
        {
          reason: 'This is a test reason',
          reasonRaw: 'This is a test reason',
          giver: {},
          receiverIds: receiverIds,
          sourceId: 'DISCORD:GUILD_ID:CHANNEL_ID',
          sourceName: 'DISCORD:GUILD_NAME:CHANNEL_NAME',
        },
      );

      expect(response.status).toBe(400);
      const rb = response.body;

      expect(rb.message).toContain('giver.accountId must be a string');
      expect(rb.message).toContain('giver.name must be a string');
      expect(rb.message).toContain('giver.platform must be a string');
    });

    test('400 when forwarder is sent without user having forwarder permissions', async () => {
      const giver = await userAccountsSeeder.seedUserAccount();

      const receiverIds = [];
      for (let i = 0; i < 3; i++) {
        const user = await userAccountsSeeder.seedUserAccount();
        receiverIds.push(user.accountId);
      }

      const response = await authorizedPostRequest(
        `/praise`,
        app,
        botUserAccessToken,
        {
          reason: 'This is a test reason',
          reasonRaw: 'This is a test reason',
          giver: {
            accountId: giver.accountId,
            name: giver.name,
            avatarId: giver.avatarId,
            platform: giver.platform,
          },
          receiverIds: receiverIds,
          sourceId: 'DISCORD:GUILD_ID:CHANNEL_ID',
          sourceName: 'DISCORD:GUILD_NAME:CHANNEL_NAME',
          forwarder: {},
        },
      );

      expect(response.status).toBe(400);
      const rb = response.body;

      expect(rb.message).toContain('property forwarder should not exist');
    });
  });

  describe('POST /api/praise/forward - bot trying to forward a praise item', () => {
    let period: Period;

    beforeEach(async () => {
      await praiseService.getModel().deleteMany({});
      await quantificationsService.getModel().deleteMany({});
      await settingsService.getModel().deleteMany({});
      await periodsService.getModel().deleteMany({});
      await periodSettingsService.getModel().deleteMany({});

      period = await periodsSeeder.seedPeriod({
        endDate: new Date(),
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

      await settingsSeeder.seedSettings({
        key: 'SELF_PRAISE_ALLOWED',
        value: false,
        type: 'Boolean',
      });

      await settingsSeeder.seedSettings({
        key: 'PRAISE_INVALID_RECEIVERS_ERROR',
        value: 'VALID RECEIVERS NOT MENTIONED',
        type: 'String',
      });

      await settingsSeeder.seedSettings({
        key: 'PRAISE_SUCCESS_MESSAGE',
        value: 'PRAISE SUCCESSFUL',
        type: 'String',
      });

      await settingsSeeder.seedSettings({
        key: 'FIRST_TIME_PRAISER',
        value: 'YOU ARE PRAISING FOR THE FIRST TIME. WELCOME TO PRAISE!',
        type: 'String',
      });
    });

    test('200 when praise is forwarded', async () => {
      const receiverIds = [];
      for (let i = 0; i < 3; i++) {
        const user = await userAccountsSeeder.seedUserAccount();
        receiverIds.push(user.accountId);
      }

      const giver = await userAccountsSeeder.seedUserAccount();
      const forwarder = await userAccountsSeeder.seedUserAccount();

      const response = await authorizedPostRequest(
        `/praise/forward`,
        app,
        botUserAccessToken,
        {
          reason: 'This is a test reason',
          reasonRaw: 'This is a test reason',
          giver: {
            accountId: giver.accountId,
            name: giver.name,
            avatarId: giver.avatarId,
            platform: giver.platform,
          },
          receiverIds: receiverIds,
          sourceId: 'DISCORD:GUILD_ID:CHANNEL_ID',
          sourceName: 'DISCORD:GUILD_NAME:CHANNEL_NAME',
          forwarder: {
            accountId: forwarder.accountId,
            name: forwarder.name,
            avatarId: forwarder.avatarId,
            platform: forwarder.platform,
          },
        },
      );

      const rb = response.body;

      expect(response.status).toBe(201);
      expect(rb).toBeInstanceOf(Array);
      expect(rb).toHaveLength(3);

      expect(rb[0]).toBeValidClass(Praise);
      expect(rb[0]).toBeProperlySerialized();
    });

    test('400 when forwarder is not sent', async () => {
      const receiverIds = [];
      for (let i = 0; i < 3; i++) {
        const user = await userAccountsSeeder.seedUserAccount();
        receiverIds.push(user.accountId);
      }

      const giver = await userAccountsSeeder.seedUserAccount();

      const response = await authorizedPostRequest(
        `/praise/forward`,
        app,
        botUserAccessToken,
        {
          reason: 'This is a test reason',
          reasonRaw: 'This is a test reason',
          giver: {
            accountId: giver.accountId,
            name: giver.name,
            avatarId: giver.avatarId,
            platform: giver.platform,
          },
          receiverIds: receiverIds,
          sourceId: 'DISCORD:GUILD_ID:CHANNEL_ID',
          sourceName: 'DISCORD:GUILD_NAME:CHANNEL_NAME',
        },
      );

      expect(response.status).toBe(400);
      const rb = response.body;

      expect(rb.message).toContain('forwarder should not be empty');
    });

    test('400 when wrong forwarder data is send', async () => {
      const receiverIds = [];
      for (let i = 0; i < 3; i++) {
        const user = await userAccountsSeeder.seedUserAccount();
        receiverIds.push(user.accountId);
      }

      const response = await authorizedPostRequest(
        `/praise/forward`,
        app,
        botUserAccessToken,
        {
          reason: 'This is a test reason',
          reasonRaw: 'This is a test reason',
          giver: {},
          forwarder: {},
          receiverIds: receiverIds,
          sourceId: 'DISCORD:GUILD_ID:CHANNEL_ID',
          sourceName: 'DISCORD:GUILD_NAME:CHANNEL_NAME',
        },
      );

      expect(response.status).toBe(400);
      const rb = response.body;

      expect(rb.message).toContain('forwarder.accountId must be a string');
      expect(rb.message).toContain('forwarder.name must be a string');
      expect(rb.message).toContain('forwarder.platform must be a string');
    });
  });
});
