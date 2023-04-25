import './shared/jest';
import request from 'supertest';
import { Wallet } from 'ethers';
import { authorizedGetRequest, loginUser } from './shared/request';
import { Period } from '../src/periods/schemas/periods.schema';
import { PeriodStatusType } from '../src/periods/enums/status-type.enum';
import { AuthRole } from '../src/auth/enums/auth-role.enum';
import { User } from '../src/users/schemas/users.schema';
import { PaginatedQueryDto } from '../src/shared/dto/pagination-query.dto';
import { Setting } from '../src/settings/schemas/settings.schema';
import { some } from 'lodash';
import { PeriodDetailsQuantifierDto } from '../src/periods/dto/period-details-quantifier.dto';
import { Praise } from '../src/praise/schemas/praise.schema';
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
  periodsService,
  settingsService,
  periodSettingsSeeder,
} from './shared/nest';

class LoggedInUser {
  accessToken: string;
  user: User;
  wallet: Wallet;
}

describe('Period (E2E)', () => {
  const users: LoggedInUser[] = [];

  beforeAll(async () => {
    // Clear the database
    await usersService.getModel().deleteMany({});
    await praiseService.getModel().deleteMany({});
    await quantificationsService.getModel().deleteMany({});
    await userAccountsService.getModel().deleteMany({});
    await periodsService.getModel().deleteMany({});
    await userAccountsService.getModel().deleteMany({});
    await settingsService.getSettingsModel().deleteMany({});
    await settingsService.getPeriodSettingsModel().deleteMany({});

    // Seed and login 3 users
    for (let i = 0; i < 3; i++) {
      const roles = [AuthRole.USER, AuthRole.QUANTIFIER];

      if (i === 0) {
        roles.push(AuthRole.ADMIN);
      }

      const wallet = Wallet.createRandom();
      const user = await usersSeeder.seedUser({
        identityEthAddress: wallet.address,
        rewardsAddress: wallet.address,
        roles,
      });
      const response = await loginUser(app, testingModule, wallet);
      users.push({
        accessToken: response.accessToken,
        user,
        wallet,
      });
    }
  });

  describe('GET /periods/{id}', () => {
    let period: Period;

    beforeEach(async () => {
      await periodsService.getModel().deleteMany({});

      period = await periodsSeeder.seedPeriod({
        status: PeriodStatusType.OPEN,
        endDate: new Date(),
      });

      const previousPeriodEndDate = new Date(period.endDate.getTime());
      previousPeriodEndDate.setDate(period.endDate.getDate() - 30);

      await periodsSeeder.seedPeriod({
        status: PeriodStatusType.OPEN,
        endDate: previousPeriodEndDate,
      });

      const previousDay = new Date(period.endDate.getTime());
      previousDay.setDate(period.endDate.getDate() - 5);

      for (let i = 0; i < 3; i++) {
        const praise = await praiseSeeder.seedPraise({
          createdAt: previousDay,
        });

        await quantificationsSeeder.seedQuantification({
          createdAt: previousDay,
          praise: praise._id,
          quantifier: users[0].user._id,
        });
      }
    });

    test('401 when not authenticated', async () => {
      return request(server).get(`/periods/${period._id}`).send().expect(401);
    });

    test('should return 200 and the period details', async () => {
      const response = await request(server)
        .get(`/periods/${period._id}`)
        .set('Authorization', `Bearer ${users[0].accessToken}`)
        .expect(200);

      const p = response.body;
      expect(p).toMatchObject({
        status: period.status,
        endDate: period.endDate.toISOString(),
        createdAt: period.createdAt.toISOString(),
        updatedAt: period.updatedAt.toISOString(),
      });

      expect(p.quantifiers).toHaveLength(1);
      expect(p.receivers).toHaveLength(6);
      expect(p.givers).toHaveLength(6);
      expect(p).toBeProperlySerialized();
      expect(p).toBeValidClass(Period);
    });

    test('should return 404 when the period does not exist', async () => {
      return request(server)
        .get(`/periods/5f5d5f5d5f5d5f5d5f5d5f5d`)
        .set('Authorization', `Bearer ${users[0].accessToken}`)
        .expect(404);
    });
  });

  describe('GET /periods/export', () => {
    let period: Period;
    const periods: Period[] = [];

    beforeAll(async () => {
      await periodsService.getModel().deleteMany({});

      period = await periodsSeeder.seedPeriod({
        status: PeriodStatusType.OPEN,
        endDate: new Date(),
      });

      periods.push(period);

      const previousPeriodEndDate = new Date(period.endDate.getTime());
      previousPeriodEndDate.setDate(period.endDate.getDate() - 30);

      periods.push(
        await periodsSeeder.seedPeriod({
          status: PeriodStatusType.OPEN,
          endDate: previousPeriodEndDate,
        }),
      );
    });

    test('returns period list that matches seeded list in json format', async () => {
      const response = await authorizedGetRequest(
        '/periods/export/json',
        app,
        users[0].accessToken,
      );
      expect(response.status).toBe(200);
      expect(response.body.length).toBe(periods.length);
      for (const returnedPeriod of response.body) {
        expect(
          periods.some(
            (periodCreated) =>
              periodCreated.endDate.toISOString() === returnedPeriod.endDate,
          ),
          // eslint-disable-next-line jest-extended/prefer-to-be-true
        ).toBe(true);
      }
    });

    test('returns period list that matches seeded list in csv format', async () => {
      const response = await authorizedGetRequest(
        '/periods/export/csv',
        app,
        users[0].accessToken,
      );
      expect(response.status).toBe(200);
      expect(response.text).toBeDefined();
      expect(response.text).toContain(periods[0].endDate.toISOString());
      expect(response.text).toContain(periods[1].endDate.toISOString());
      expect(response.text).toContain('_id');
      expect(response.text).toContain('name');
      expect(response.text).toContain('status');
      expect(response.text).toContain('endDate');
      expect(response.text).toContain('createdAt');
      expect(response.text).toContain('updatedAt');
    });
  });

  describe('GET /periods', () => {
    let period: Period;

    beforeEach(async () => {
      await periodsService.getModel().deleteMany({});

      period = await periodsSeeder.seedPeriod({
        status: PeriodStatusType.OPEN,
        endDate: new Date(),
      });

      const previousPeriodEndDate = new Date(period.endDate.getTime());
      previousPeriodEndDate.setDate(period.endDate.getDate() - 30);

      await periodsSeeder.seedPeriod({
        status: PeriodStatusType.OPEN,
        endDate: previousPeriodEndDate,
      });
    });

    test('401 when not authenticated', async () => {
      return request(server).get(`/periods`).send().expect(401);
    });

    test('200 when correct data is sent', async () => {
      const response = await authorizedGetRequest(
        '/periods',
        app,
        users[0].accessToken,
      );
      expect(response.status).toBe(200);

      const p = response.body.docs[0];
      expect(p).toBeProperlySerialized();
      expect(p).toBeValidClass(Period);
    });

    test('should return the expected pagination object when called with query parameters', async () => {
      await periodsService.getModel().deleteMany({});

      const p: Period[] = [];
      // Seed the database with 12 praise items
      for (let i = 0; i < 12; i++) {
        p.push(await periodsSeeder.seedPeriod());
      }

      const options: PaginatedQueryDto = {
        sortColumn: 'createdAt',
        sortType: 'asc',
        page: 1,
        limit: 10,
      };

      const urlParams = Object.entries(options)
        .map(([key, val]) => `${key}=${val}`)
        .join('&');

      const response = await authorizedGetRequest(
        `/periods?${urlParams}`,
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

      const period = response.body.docs[0];
      const period2 = p.find((x) => x._id.toString() === period._id);
      expect(period).toBeDefined();
      expect(period2).toBeDefined();
      if (period2) {
        expect(period._id).toBe(period2._id.toString());
        expect(period.status).toBe(period2.status);
        expect(period.endDate).toBe(period2.endDate.toISOString());
        expect(period.name).toBe(period2.name);
      }

      expect(period).toBeProperlySerialized();
      expect(period).toBeValidClass(Period);
    });
  });

  describe('POST /periods', () => {
    beforeEach(async () => {
      await periodsService.getModel().deleteMany({});
    });

    test('401 when not authenticated', async () => {
      return request(server).post(`/periods`).send().expect(401);
    });

    test('should return 403 when the user is not an admin', async () => {
      return request(server)
        .post(`/periods`)
        .set('Authorization', `Bearer ${users[1].accessToken}`)
        .send()
        .expect(403);
    });

    test('should return 400 when the request body is invalid', async () => {
      return request(server)
        .post(`/periods`)
        .set('Authorization', `Bearer ${users[0].accessToken}`)
        .send({
          name: 'Test period',
          endDate: 'invalid date',
        })
        .expect(400);
    });

    test('should return 201 and period details when the request body is valid', async () => {
      const endDate = new Date();

      const response = await request(server)
        .post(`/periods`)
        .set('Authorization', `Bearer ${users[0].accessToken}`)
        .send({
          name: 'Test period',
          endDate,
        })
        .expect(201);

      const p = response.body;
      expect(p).toMatchObject({
        status: PeriodStatusType.OPEN,
        endDate: endDate.toISOString(),
      });

      expect(p.quantifiers).toBeDefined();
      expect(p.receivers).toBeDefined();
      expect(p.givers).toBeDefined();
      expect(p).toBeProperlySerialized();
      expect(p).toBeValidClass(Period);
    });

    test('should return 400 when period with the same name already exists', async () => {
      const endDate = new Date();

      await request(server)
        .post(`/periods`)
        .set('Authorization', `Bearer ${users[0].accessToken}`)
        .send({
          name: 'Test period',
          endDate,
        })
        .expect(201);

      return request(server)
        .post(`/periods`)
        .set('Authorization', `Bearer ${users[0].accessToken}`)
        .send({
          name: 'Test period',
          endDate,
        })
        .expect(400);
    });

    test('should return 400 when period endDate is not at least 7 day after the latest endDate', async () => {
      const endDate = new Date();

      await request(server)
        .post(`/periods`)
        .set('Authorization', `Bearer ${users[0].accessToken}`)
        .send({
          name: 'Test period',
          endDate,
        })
        .expect(201);

      const response = await request(server)
        .post(`/periods`)
        .set('Authorization', `Bearer ${users[0].accessToken}`)
        .send({
          name: 'Test period 2',
          endDate,
        })
        .expect(400);

      expect(response.body.message).toBe(
        'End date must be at least 7 days after the latest end date',
      );
    });
  });

  describe('PATCH /periods/{id}', () => {
    let period: Period;

    beforeEach(async () => {
      await periodsService.getModel().deleteMany({});

      period = await periodsSeeder.seedPeriod({
        status: PeriodStatusType.OPEN,
        endDate: new Date(),
      });
    });

    test('401 when not authenticated', async () => {
      return request(server).patch(`/periods/${period._id}`).send().expect(401);
    });

    test('should return 403 when the user is not an admin', async () => {
      return request(server)
        .patch(`/periods/${period._id}`)
        .set('Authorization', `Bearer ${users[1].accessToken}`)
        .send()
        .expect(403);
    });

    test('should return 404 when the period does not exist', async () => {
      return request(server)
        .patch(`/periods/5f5d5f5d5f5d5f5d5f5d5f5d`)
        .set('Authorization', `Bearer ${users[0].accessToken}`)
        .expect(404);
    });

    test('should return 400 when the request body is invalid', async () => {
      return request(server)
        .patch(`/periods/${period._id}`)
        .set('Authorization', `Bearer ${users[0].accessToken}`)
        .send({
          name: 'Test period',
          endDate: 'invalid date',
        })
        .expect(400);
    });

    test('should return 400 when endDate and name are not specified', async () => {
      const response = await request(server)
        .patch(`/periods/${period._id}`)
        .set('Authorization', `Bearer ${users[0].accessToken}`)
        .send()
        .expect(400);

      expect(response.body.message).toBe(
        'Updated name or endDate to must be specified',
      );
    });

    test('should return 400 when trying to update endDate on period that is not the latest one', async () => {
      const endDate = new Date();

      await periodsSeeder.seedPeriod({
        status: PeriodStatusType.OPEN,
        endDate: new Date(),
      });

      const response = await request(server)
        .patch(`/periods/${period._id}`)
        .set('Authorization', `Bearer ${users[0].accessToken}`)
        .send({
          endDate,
        })
        .expect(400);

      expect(response.body.message).toBe(
        'Date change only allowed on latest period.',
      );
    });

    test('should return 400 when period does not have status === OPEN', async () => {
      const endDate = new Date();

      const period = await periodsSeeder.seedPeriod({
        status: PeriodStatusType.CLOSED,
        endDate,
      });

      const changedDate = new Date();
      changedDate.setDate(period.endDate.getDate() + 1);

      const response = await request(server)
        .patch(`/periods/${period._id}`)
        .set('Authorization', `Bearer ${users[0].accessToken}`)
        .send({
          endDate: changedDate,
        })
        .expect(400);

      expect(response.body.message).toBe(
        'Date change only allowed on open periods.',
      );
    });

    test('should return 200 and period details when the request body is valid', async () => {
      const endDate = new Date();

      const response = await request(server)
        .patch(`/periods/${period._id}`)
        .set('Authorization', `Bearer ${users[0].accessToken}`)
        .send({
          name: 'Test period',
          endDate,
        })
        .expect(200);

      const p = response.body;
      expect(p).toMatchObject({
        status: PeriodStatusType.OPEN,
        endDate: endDate.toISOString(),
      });

      expect(p.quantifiers).toBeDefined();
      expect(p.receivers).toBeDefined();
      expect(p.givers).toBeDefined();
      expect(p).toBeProperlySerialized();
      expect(p).toBeValidClass(Period);
    });
  });

  describe('PACTH /periods/{id}/close', () => {
    let period: Period;

    beforeEach(async () => {
      await periodsService.getModel().deleteMany({});

      period = await periodsSeeder.seedPeriod({
        status: PeriodStatusType.OPEN,
        endDate: new Date(),
      });
    });

    test('401 when not authenticated', async () => {
      return request(server)
        .patch(`/periods/${period._id}/close`)
        .send()
        .expect(401);
    });

    test('should return 403 when the user is not an admin', async () => {
      request(server)
        .patch(`/periods/${period._id}/close`)
        .set('Authorization', `Bearer ${users[1].accessToken}`)
        .send()
        .expect(403);
    });

    test('should return 404 when the period does not exist', async () => {
      await request(server)
        .patch(`/periods/5f5d5f5d5f5d5f5d5f5d5f5d/close`)
        .set('Authorization', `Bearer ${users[0].accessToken}`)
        .expect(404);
    });

    test('should return 400 when the period is not open', async () => {
      const period = await periodsSeeder.seedPeriod({
        status: PeriodStatusType.CLOSED,
        endDate: new Date(),
      });

      return request(server)
        .patch(`/periods/${period._id}/close`)
        .set('Authorization', `Bearer ${users[0].accessToken}`)
        .expect(400);
    });

    test('should return 400 when the period endDate is in the future', async () => {
      const period = await periodsSeeder.seedPeriod({
        status: PeriodStatusType.CLOSED,
        endDate: faker.date.future(),
      });

      return request(server)
        .patch(`/periods/${period._id}/close`)
        .set('Authorization', `Bearer ${users[0].accessToken}`)
        .expect(400);
    });

    test('should return 200 and period details when the request body is valid adnd endDate is in the past', async () => {
      const period = await periodsSeeder.seedPeriod({
        status: PeriodStatusType.OPEN,
        endDate: faker.date.past(),
      });

      const response = await request(server)
        .patch(`/periods/${period._id}/close`)
        .set('Authorization', `Bearer ${users[0].accessToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        status: PeriodStatusType.CLOSED,
      });

      const p = response.body;
      expect(p.quantifiers).toBeDefined();
      expect(p.receivers).toBeDefined();
      expect(p.givers).toBeDefined();
      expect(p).toBeProperlySerialized();
      expect(p).toBeValidClass(Period);
    });
  });

  describe('GET /periods/{id}/praise', () => {
    let period: Period;

    beforeEach(async () => {
      await periodsService.getModel().deleteMany({});

      period = await periodsSeeder.seedPeriod({
        status: PeriodStatusType.OPEN,
        endDate: new Date(),
      });

      const previousPeriodEndDate = new Date(period.endDate.getTime());
      previousPeriodEndDate.setDate(period.endDate.getDate() - 30);

      await periodsSeeder.seedPeriod({
        status: PeriodStatusType.OPEN,
        endDate: previousPeriodEndDate,
      });

      const previousDay = new Date(period.endDate.getTime());
      previousDay.setDate(period.endDate.getDate() - 5);

      for (let i = 0; i < 3; i++) {
        const praise = await praiseSeeder.seedPraise({
          createdAt: previousDay,
        });

        await quantificationsSeeder.seedQuantification({
          createdAt: previousDay,
          praise: praise._id,
          quantifier: users[0].user._id,
        });
      }
    });

    test('401 when not authenticated', async () => {
      return request(server)
        .get(`/periods/${period._id}/praise`)
        .send()
        .expect(401);
    });

    test('should return 404 when the period does not exist', async () => {
      await praiseService.getModel().deleteMany({});

      const response = await request(server)
        .get(`/periods/5f5d5f5d5f5d5f5d5f5d5f5d/praise`)
        .set('Authorization', `Bearer ${users[0].accessToken}`)
        .expect(404);

      expect(response.body.code).toBe(1009);
    });

    test('should return 200 and list of praise items', async () => {
      const response = await request(server)
        .get(`/periods/${period._id}/praise`)
        .set('Authorization', `Bearer ${users[0].accessToken}`)
        .expect(200);

      const p = response.body[0];
      expect(response.body).toHaveLength(3);
      expect(p.quantifications).toHaveLength(1);
      expect(p.quantifications[0].quantifier).toBeDefined();
      expect(p.receiver).toBeDefined();
      expect(p.giver).toBeDefined();
      expect(p).toBeProperlySerialized();
      expect(p).toBeValidClass(Praise);
    });
  });

  describe('PATCH /periods/:periodId/assignQuantifiers', () => {
    let PRAISE_QUANTIFIERS_PER_PRAISE_RECEIVER: Setting;
    let PRAISE_QUANTIFIERS_ASSIGN_EVENLY: Setting;

    beforeEach(async () => {
      await periodsService.getModel().deleteMany({});
      await praiseService.getModel().deleteMany({});
      await usersService.getModel().deleteMany({});
      await userAccountsService.getModel().deleteMany({});
      await settingsService.getPeriodSettingsModel().deleteMany({});
      await quantificationsService.getModel().deleteMany({});
      await settingsService.getSettingsModel().deleteMany({});

      PRAISE_QUANTIFIERS_PER_PRAISE_RECEIVER =
        await settingsSeeder.seedSettings({
          key: 'PRAISE_QUANTIFIERS_PER_PRAISE_RECEIVER',
          value: '2',
          type: 'Integer',
        });

      PRAISE_QUANTIFIERS_ASSIGN_EVENLY = await settingsSeeder.seedSettings({
        key: 'PRAISE_QUANTIFIERS_ASSIGN_EVENLY',
        value: 'false',
        type: 'Boolean',
      });
    });

    test('200 response with json body containing assignments with PRAISE_QUANTIFIERS_ASSIGN_EVENLY=false', async function () {
      const wallet = Wallet.createRandom();
      await usersSeeder.seedUser({
        identityEthAddress: wallet.address,
        roles: [AuthRole.USER, AuthRole.ADMIN],
      });

      const receiver1 = await userAccountsSeeder.seedUserAccount();
      const receiver2 = await userAccountsSeeder.seedUserAccount();
      const receiver3 = await userAccountsSeeder.seedUserAccount();

      const receiversSorted = [receiver1, receiver2, receiver3].sort((a, b) =>
        a._id.toString().localeCompare(b._id.toString()),
      );

      const period = await periodsSeeder.seedPeriod();

      const dayInPeriod = new Date(period.endDate.getTime());
      dayInPeriod.setDate(period.endDate.getDate() - 1);

      const wallet1 = Wallet.createRandom();
      const quantifierUser1 = await usersSeeder.seedUser({
        identityEthAddress: wallet1.address,
        roles: [AuthRole.USER, AuthRole.QUANTIFIER],
      });

      const quantifier1 = await userAccountsSeeder.seedUserAccount({
        user: quantifierUser1._id,
      });

      const wallet2 = Wallet.createRandom();
      const quantifierUser2 = await usersSeeder.seedUser({
        identityEthAddress: wallet2.address,
        roles: [AuthRole.USER, AuthRole.QUANTIFIER],
      });

      await userAccountsSeeder.seedUserAccount({
        user: quantifierUser2._id,
      });

      const praise = await praiseSeeder.seedPraise({
        receiver: receiver1._id,
        createdAt: dayInPeriod,
      });

      await quantificationsSeeder.seedQuantification({
        praise: praise._id,
        quantifier: quantifier1._id,
      });

      await praiseSeeder.seedPraise({
        receiver: receiver1._id,
        createdAt: dayInPeriod,
      });
      await praiseSeeder.seedPraise({
        receiver: receiver1._id,
        createdAt: dayInPeriod,
      });
      await praiseSeeder.seedPraise({
        receiver: receiver1._id,
        createdAt: dayInPeriod,
      });
      await praiseSeeder.seedPraise({
        receiver: receiver1._id,
        createdAt: dayInPeriod,
      });
      await praiseSeeder.seedPraise({
        receiver: receiver2._id,
        createdAt: dayInPeriod,
      });
      await praiseSeeder.seedPraise({
        receiver: receiver2._id,
        createdAt: dayInPeriod,
      });
      await praiseSeeder.seedPraise({
        receiver: receiver2._id,
        createdAt: dayInPeriod,
      });
      await praiseSeeder.seedPraise({
        receiver: receiver2._id,
        createdAt: dayInPeriod,
      });
      await praiseSeeder.seedPraise({
        receiver: receiver3._id,
        createdAt: dayInPeriod,
      });
      await praiseSeeder.seedPraise({
        receiver: receiver3._id,
        createdAt: dayInPeriod,
      });
      await praiseSeeder.seedPraise({
        receiver: receiver3._id,
        createdAt: dayInPeriod,
      });
      await praiseSeeder.seedPraise({
        receiver: receiver3._id,
        createdAt: dayInPeriod,
      });

      await periodSettingsSeeder.seedPeriodSettings({
        period: period._id,
        setting: PRAISE_QUANTIFIERS_PER_PRAISE_RECEIVER._id,
        value: 2,
      });

      await periodSettingsSeeder.seedPeriodSettings({
        period: period._id,
        setting: PRAISE_QUANTIFIERS_ASSIGN_EVENLY._id,
        value: 'false',
      });

      await usersSeeder.seedUser({
        roles: [AuthRole.USER, AuthRole.QUANTIFIER],
      });
      await usersSeeder.seedUser({
        roles: [AuthRole.USER, AuthRole.QUANTIFIER],
      });
      await usersSeeder.seedUser({
        roles: [AuthRole.USER, AuthRole.QUANTIFIER],
      });
      await usersSeeder.seedUser({
        roles: [AuthRole.USER, AuthRole.QUANTIFIER],
      });

      const response = await request(server)
        .patch(`/periods/${period._id.toString() as string}/assignQuantifiers`)
        .set('Authorization', `Bearer ${users[0].accessToken}`)
        .send()
        .expect('Content-Type', /json/)
        .expect(200);

      const p = response.body;

      expect(p._id).toEqual(period._id.toString());
      expect(p.status).toEqual('QUANTIFY');

      expect(p.receivers).toHaveLength(3);
      expect(p.receivers[0]._id).toEqual(receiversSorted[0]._id.toString());
      expect(p.receivers[0].praiseCount).toEqual(5);

      expect(p.receivers[1]._id).toEqual(receiversSorted[1]._id.toString());
      expect(p.receivers[1].praiseCount).toEqual(4);

      expect(p.receivers[2]._id).toEqual(receiversSorted[2]._id.toString());
      expect(p.receivers[2].praiseCount).toEqual(4);

      expect(p.quantifiers).toHaveLength(6);

      expect(p.quantifiers[0].finishedCount).toEqual(0);
      expect(p.quantifiers[1].finishedCount).toEqual(0);
      expect(p.quantifiers[2].finishedCount).toEqual(0);
      expect(p).toBeProperlySerialized();
      expect(p).toBeValidClass(Period);
    });

    test('200, 1 quantifiers, PRAISE_QUANTIFIERS_ASSIGN_EVENLY=true', async function () {
      const wallet = Wallet.createRandom();
      await usersSeeder.seedUser({
        identityEthAddress: wallet.address,
        roles: [AuthRole.USER, AuthRole.ADMIN],
      });

      const receiver1 = await userAccountsSeeder.seedUserAccount();
      const receiver2 = await userAccountsSeeder.seedUserAccount();
      const receiver3 = await userAccountsSeeder.seedUserAccount();

      const receiversSorted = [receiver1, receiver2, receiver3].sort((a, b) =>
        a._id.toString().localeCompare(b._id.toString()),
      );

      const period = await periodsSeeder.seedPeriod();

      const dayInPeriod = new Date(period.endDate.getTime());
      dayInPeriod.setDate(period.endDate.getDate() - 1);

      const quantifier = await userAccountsSeeder.seedUserAccount();

      const praise = await praiseSeeder.seedPraise({
        receiver: receiver1._id,
        createdAt: dayInPeriod,
      });

      await quantificationsSeeder.seedQuantification({
        praise: praise._id,
        quantifier: quantifier._id,
      });

      await praiseSeeder.seedPraise({
        receiver: receiver1._id,
        createdAt: dayInPeriod,
      });
      await praiseSeeder.seedPraise({
        receiver: receiver1._id,
        createdAt: dayInPeriod,
      });
      await praiseSeeder.seedPraise({
        receiver: receiver1._id,
        createdAt: dayInPeriod,
      });
      await praiseSeeder.seedPraise({
        receiver: receiver1._id,
        createdAt: dayInPeriod,
      });
      await praiseSeeder.seedPraise({
        receiver: receiver2._id,
        createdAt: dayInPeriod,
      });
      await praiseSeeder.seedPraise({
        receiver: receiver2._id,
        createdAt: dayInPeriod,
      });
      await praiseSeeder.seedPraise({
        receiver: receiver2._id,
        createdAt: dayInPeriod,
      });
      await praiseSeeder.seedPraise({
        receiver: receiver2._id,
        createdAt: dayInPeriod,
      });
      await praiseSeeder.seedPraise({
        receiver: receiver3._id,
        createdAt: dayInPeriod,
      });
      await praiseSeeder.seedPraise({
        receiver: receiver3._id,
        createdAt: dayInPeriod,
      });
      await praiseSeeder.seedPraise({
        receiver: receiver3._id,
        createdAt: dayInPeriod,
      });
      await praiseSeeder.seedPraise({
        receiver: receiver3._id,
        createdAt: dayInPeriod,
      });

      await periodSettingsSeeder.seedPeriodSettings({
        period: period._id,
        setting: PRAISE_QUANTIFIERS_PER_PRAISE_RECEIVER._id,
        value: '1',
      });

      await periodSettingsSeeder.seedPeriodSettings({
        period: period._id,
        setting: PRAISE_QUANTIFIERS_ASSIGN_EVENLY._id,
        value: 'true',
      });

      await usersSeeder.seedUser({
        roles: [AuthRole.USER, AuthRole.QUANTIFIER],
      });

      const response = await request(server)
        .patch(`/periods/${period._id.toString() as string}/assignQuantifiers`)
        .set('Authorization', `Bearer ${users[0].accessToken}`)
        .send()
        .expect('Content-Type', /json/)
        .expect(200);

      const p = response.body;
      expect(p._id).toEqual(period._id.toString());
      expect(p.status).toEqual('QUANTIFY');

      expect(p.receivers).toHaveLength(3);
      expect(p.receivers[0]._id).toEqual(receiversSorted[0]._id.toString());
      expect(p.receivers[0].praiseCount).toEqual(5);

      expect(p.receivers[1]._id).toEqual(receiversSorted[1]._id.toString());
      expect(p.receivers[1].praiseCount).toEqual(4);

      expect(p.receivers[2]._id).toEqual(receiversSorted[2]._id.toString());
      expect(p.receivers[2].praiseCount).toEqual(4);

      expect(p.quantifiers).toHaveLength(1);
      expect(p.quantifiers[0].finishedCount).toEqual(0);

      // All praises are assigned to the quantifier
      expect(p.quantifiers[0].praiseCount).toEqual(p.numberOfPraise);

      expect(p).toBeProperlySerialized();
      expect(p).toBeValidClass(Period);
    });

    test('200, 2 quantifiers, PRAISE_QUANTIFIERS_ASSIGN_EVENLY=true', async function () {
      const wallet = Wallet.createRandom();
      await usersSeeder.seedUser({
        identityEthAddress: wallet.address,
        roles: [AuthRole.USER, AuthRole.ADMIN],
      });

      const receiver1 = await userAccountsSeeder.seedUserAccount();
      const receiver2 = await userAccountsSeeder.seedUserAccount();
      const receiver3 = await userAccountsSeeder.seedUserAccount();

      const receiversSorted = [receiver1, receiver2, receiver3].sort((a, b) =>
        a._id.toString().localeCompare(b._id.toString()),
      );

      const period = await periodsSeeder.seedPeriod();

      const dayInPeriod = new Date(period.endDate.getTime());
      dayInPeriod.setDate(period.endDate.getDate() - 1);

      const quantifier = await userAccountsSeeder.seedUserAccount();

      const praise = await praiseSeeder.seedPraise({
        receiver: receiver1._id,
        createdAt: dayInPeriod,
      });

      await quantificationsSeeder.seedQuantification({
        praise: praise._id,
        quantifier: quantifier._id,
      });

      await praiseSeeder.seedPraise({
        receiver: receiver1._id,
        createdAt: dayInPeriod,
      });
      await praiseSeeder.seedPraise({
        receiver: receiver1._id,
        createdAt: dayInPeriod,
      });
      await praiseSeeder.seedPraise({
        receiver: receiver1._id,
        createdAt: dayInPeriod,
      });
      await praiseSeeder.seedPraise({
        receiver: receiver1._id,
        createdAt: dayInPeriod,
      });
      await praiseSeeder.seedPraise({
        receiver: receiver2._id,
        createdAt: dayInPeriod,
      });
      await praiseSeeder.seedPraise({
        receiver: receiver2._id,
        createdAt: dayInPeriod,
      });
      await praiseSeeder.seedPraise({
        receiver: receiver2._id,
        createdAt: dayInPeriod,
      });
      await praiseSeeder.seedPraise({
        receiver: receiver2._id,
        createdAt: dayInPeriod,
      });
      await praiseSeeder.seedPraise({
        receiver: receiver3._id,
        createdAt: dayInPeriod,
      });
      await praiseSeeder.seedPraise({
        receiver: receiver3._id,
        createdAt: dayInPeriod,
      });
      await praiseSeeder.seedPraise({
        receiver: receiver3._id,
        createdAt: dayInPeriod,
      });
      await praiseSeeder.seedPraise({
        receiver: receiver3._id,
        createdAt: dayInPeriod,
      });

      await periodSettingsSeeder.seedPeriodSettings({
        period: period._id,
        setting: PRAISE_QUANTIFIERS_PER_PRAISE_RECEIVER._id,
        value: '1',
      });

      await periodSettingsSeeder.seedPeriodSettings({
        period: period._id,
        setting: PRAISE_QUANTIFIERS_ASSIGN_EVENLY._id,
        value: 'true',
      });

      await usersSeeder.seedUser({
        roles: [AuthRole.USER, AuthRole.QUANTIFIER],
      });

      await usersSeeder.seedUser({
        roles: [AuthRole.USER, AuthRole.QUANTIFIER],
      });

      const response = await request(server)
        .patch(`/periods/${period._id.toString() as string}/assignQuantifiers`)
        .set('Authorization', `Bearer ${users[0].accessToken}`)
        .send()
        .expect('Content-Type', /json/)
        .expect(200);

      const p = response.body;
      expect(p._id).toEqual(period._id.toString());
      expect(p.status).toEqual('QUANTIFY');

      expect(p.receivers).toHaveLength(3);
      expect(p.receivers[0]._id).toEqual(receiversSorted[0]._id.toString());
      expect(p.receivers[0].praiseCount).toEqual(5);

      expect(p.receivers[1]._id).toEqual(receiversSorted[1]._id.toString());
      expect(p.receivers[1].praiseCount).toEqual(4);

      expect(p.receivers[2]._id).toEqual(receiversSorted[2]._id.toString());
      expect(p.receivers[2].praiseCount).toEqual(4);

      expect(p.quantifiers).toHaveLength(2);

      // All praises are assigned to the quantifier
      expect(
        p.quantifiers[0].praiseCount + p.quantifiers[1].praiseCount,
      ).toEqual(p.numberOfPraise);

      expect(p).toBeProperlySerialized();
      expect(p).toBeValidClass(Period);
    });

    test('200, 2 quantifiers, PRAISE_QUANTIFIERS_PER_PRAISE_RECEIVER=2, PRAISE_QUANTIFIERS_ASSIGN_EVENLY=true', async function () {
      const wallet = Wallet.createRandom();
      await usersSeeder.seedUser({
        identityEthAddress: wallet.address,
        roles: [AuthRole.USER, AuthRole.ADMIN],
      });

      const receiver1 = await userAccountsSeeder.seedUserAccount();
      const receiver2 = await userAccountsSeeder.seedUserAccount();
      const receiver3 = await userAccountsSeeder.seedUserAccount();

      const receiversSorted = [receiver1, receiver2, receiver3].sort((a, b) =>
        a._id.toString().localeCompare(b._id.toString()),
      );

      const period = await periodsSeeder.seedPeriod();

      const dayInPeriod = new Date(period.endDate.getTime());
      dayInPeriod.setDate(period.endDate.getDate() - 1);

      const quantifier = await userAccountsSeeder.seedUserAccount();

      const praise = await praiseSeeder.seedPraise({
        receiver: receiver1._id,
        createdAt: dayInPeriod,
      });

      await quantificationsSeeder.seedQuantification({
        praise: praise._id,
        quantifier: quantifier._id,
      });

      await praiseSeeder.seedPraise({
        receiver: receiver1._id,
        createdAt: dayInPeriod,
      });
      await praiseSeeder.seedPraise({
        receiver: receiver1._id,
        createdAt: dayInPeriod,
      });
      await praiseSeeder.seedPraise({
        receiver: receiver1._id,
        createdAt: dayInPeriod,
      });
      await praiseSeeder.seedPraise({
        receiver: receiver1._id,
        createdAt: dayInPeriod,
      });
      await praiseSeeder.seedPraise({
        receiver: receiver2._id,
        createdAt: dayInPeriod,
      });
      await praiseSeeder.seedPraise({
        receiver: receiver2._id,
        createdAt: dayInPeriod,
      });
      await praiseSeeder.seedPraise({
        receiver: receiver2._id,
        createdAt: dayInPeriod,
      });
      await praiseSeeder.seedPraise({
        receiver: receiver2._id,
        createdAt: dayInPeriod,
      });
      await praiseSeeder.seedPraise({
        receiver: receiver3._id,
        createdAt: dayInPeriod,
      });
      await praiseSeeder.seedPraise({
        receiver: receiver3._id,
        createdAt: dayInPeriod,
      });
      await praiseSeeder.seedPraise({
        receiver: receiver3._id,
        createdAt: dayInPeriod,
      });
      await praiseSeeder.seedPraise({
        receiver: receiver3._id,
        createdAt: dayInPeriod,
      });

      await periodSettingsSeeder.seedPeriodSettings({
        period: period._id,
        setting: PRAISE_QUANTIFIERS_PER_PRAISE_RECEIVER._id,
        value: '2',
      });

      await periodSettingsSeeder.seedPeriodSettings({
        period: period._id,
        setting: PRAISE_QUANTIFIERS_ASSIGN_EVENLY._id,
        value: 'true',
      });

      await usersSeeder.seedUser({
        roles: [AuthRole.USER, AuthRole.QUANTIFIER],
      });

      await usersSeeder.seedUser({
        roles: [AuthRole.USER, AuthRole.QUANTIFIER],
      });

      const response = await request(server)
        .patch(`/periods/${period._id.toString() as string}/assignQuantifiers`)
        .set('Authorization', `Bearer ${users[0].accessToken}`)
        .send()
        .expect('Content-Type', /json/)
        .expect(200);

      const p = response.body;
      expect(p._id).toEqual(period._id.toString());
      expect(p.status).toEqual('QUANTIFY');

      expect(p.receivers).toHaveLength(3);
      expect(p.receivers[0]._id).toEqual(receiversSorted[0]._id.toString());
      expect(p.receivers[0].praiseCount).toEqual(5);

      expect(p.receivers[1]._id).toEqual(receiversSorted[1]._id.toString());
      expect(p.receivers[1].praiseCount).toEqual(4);

      expect(p.receivers[2]._id).toEqual(receiversSorted[2]._id.toString());
      expect(p.receivers[2].praiseCount).toEqual(4);

      expect(p.quantifiers).toHaveLength(2);

      // Both quantifiers have 13 praises assigned
      expect(p.quantifiers[0].praiseCount).toEqual(p.numberOfPraise);
      expect(p.quantifiers[1].praiseCount).toEqual(p.numberOfPraise);

      expect(p).toBeProperlySerialized();
      expect(p).toBeValidClass(Period);
    });

    test('200, 4 quantifier, response containing assignments, PRAISE_QUANTIFIERS_ASSIGN_EVENLY=true', async function () {
      const wallet = Wallet.createRandom();
      await usersSeeder.seedUser({
        identityEthAddress: wallet.address,
        roles: [AuthRole.USER, AuthRole.ADMIN],
      });

      const receiver1 = await userAccountsSeeder.seedUserAccount();
      const receiver2 = await userAccountsSeeder.seedUserAccount();
      const receiver3 = await userAccountsSeeder.seedUserAccount();

      const receiversSorted = [receiver1, receiver2, receiver3].sort((a, b) =>
        a._id.toString().localeCompare(b._id.toString()),
      );

      const period = await periodsSeeder.seedPeriod();

      const dayInPeriod = new Date(period.endDate.getTime());
      dayInPeriod.setDate(period.endDate.getDate() - 1);

      const quantifier = await userAccountsSeeder.seedUserAccount();

      const praise = await praiseSeeder.seedPraise({
        receiver: receiver1._id,
        createdAt: dayInPeriod,
      });

      await quantificationsSeeder.seedQuantification({
        praise: praise._id,
        quantifier: quantifier._id,
      });

      await praiseSeeder.seedPraise({
        receiver: receiver1._id,
        createdAt: dayInPeriod,
      });
      await praiseSeeder.seedPraise({
        receiver: receiver1._id,
        createdAt: dayInPeriod,
      });
      await praiseSeeder.seedPraise({
        receiver: receiver1._id,
        createdAt: dayInPeriod,
      });
      await praiseSeeder.seedPraise({
        receiver: receiver1._id,
        createdAt: dayInPeriod,
      });
      await praiseSeeder.seedPraise({
        receiver: receiver2._id,
        createdAt: dayInPeriod,
      });
      await praiseSeeder.seedPraise({
        receiver: receiver2._id,
        createdAt: dayInPeriod,
      });
      await praiseSeeder.seedPraise({
        receiver: receiver2._id,
        createdAt: dayInPeriod,
      });
      await praiseSeeder.seedPraise({
        receiver: receiver2._id,
        createdAt: dayInPeriod,
      });
      await praiseSeeder.seedPraise({
        receiver: receiver3._id,
        createdAt: dayInPeriod,
      });
      await praiseSeeder.seedPraise({
        receiver: receiver3._id,
        createdAt: dayInPeriod,
      });
      await praiseSeeder.seedPraise({
        receiver: receiver3._id,
        createdAt: dayInPeriod,
      });
      await praiseSeeder.seedPraise({
        receiver: receiver3._id,
        createdAt: dayInPeriod,
      });

      await periodSettingsSeeder.seedPeriodSettings({
        period: period._id,
        setting: PRAISE_QUANTIFIERS_PER_PRAISE_RECEIVER._id,
        value: '2',
      });

      await periodSettingsSeeder.seedPeriodSettings({
        period: period._id,
        setting: PRAISE_QUANTIFIERS_ASSIGN_EVENLY._id,
        value: 'true',
      });

      await usersSeeder.seedUser({
        roles: [AuthRole.USER, AuthRole.QUANTIFIER],
      });
      await usersSeeder.seedUser({
        roles: [AuthRole.USER, AuthRole.QUANTIFIER],
      });
      await usersSeeder.seedUser({
        roles: [AuthRole.USER, AuthRole.QUANTIFIER],
      });
      await usersSeeder.seedUser({
        roles: [AuthRole.USER, AuthRole.QUANTIFIER],
      });

      const response = await request(server)
        .patch(`/periods/${period._id.toString() as string}/assignQuantifiers`)
        .set('Authorization', `Bearer ${users[0].accessToken}`)
        .send()
        .expect('Content-Type', /json/)
        .expect(200);

      const p = response.body;
      expect(p._id).toEqual(period._id.toString());
      expect(p.status).toEqual('QUANTIFY');

      expect(p.receivers).toHaveLength(3);
      expect(p.receivers[0]._id).toEqual(receiversSorted[0]._id.toString());
      expect(p.receivers[0].praiseCount).toEqual(5);

      expect(p.receivers[1]._id).toEqual(receiversSorted[1]._id.toString());
      expect(p.receivers[1].praiseCount).toEqual(4);

      expect(p.receivers[2]._id).toEqual(receiversSorted[2]._id.toString());
      expect(p.receivers[2].praiseCount).toEqual(4);

      const quantifiersWith9Praises = p.quantifiers.filter(
        (quantifier: PeriodDetailsQuantifierDto) =>
          quantifier.praiseCount === 9,
      );
      const quantifiersWith4Praises = p.quantifiers.filter(
        (quantifier: PeriodDetailsQuantifierDto) =>
          quantifier.praiseCount === 4,
      );

      expect(quantifiersWith9Praises).toHaveLength(2);
      expect(quantifiersWith4Praises).toHaveLength(2);
      expect(p).toBeProperlySerialized();
      expect(p).toBeValidClass(Period);
    });

    test('200 response when praise items number = 200 and PRAISE_QUANTIFIERS_ASSIGN_EVENLY=true', async function () {
      const wallet = Wallet.createRandom();
      await usersSeeder.seedUser({
        identityEthAddress: wallet.address,
        roles: [AuthRole.USER, AuthRole.ADMIN],
      });

      const period = await periodsSeeder.seedPeriod();

      const dayInPeriod = new Date(period.endDate.getTime());
      dayInPeriod.setDate(period.endDate.getDate() - 1);

      // create 20 receivers
      for (let i = 0; i < 20; i++) {
        await userAccountsSeeder.seedUserAccount();
      }

      const receivers = await userAccountsService.getModel().find().lean();

      // create 200 praises and evenly distribute them among receivers
      for (let i = 0; i < 200; i++) {
        await praiseSeeder.seedPraise({
          receiver: receivers[i % 20]._id,
          createdAt: dayInPeriod,
        });
      }

      const praiseItems = await praiseService.getModel().find().lean();

      // create 3 quantifiers
      for (let i = 0; i < 3; i++) {
        await usersSeeder.seedUser({
          roles: [AuthRole.USER, AuthRole.QUANTIFIER],
        });
      }

      const quantifiers = await usersService
        .getModel()
        .find({ roles: AuthRole.QUANTIFIER })
        .lean();

      await periodSettingsSeeder.seedPeriodSettings({
        period: period._id,
        setting: PRAISE_QUANTIFIERS_PER_PRAISE_RECEIVER._id,
        value: 3,
      });

      await periodSettingsSeeder.seedPeriodSettings({
        period: period._id,
        setting: PRAISE_QUANTIFIERS_ASSIGN_EVENLY._id,
        value: 'true',
      });

      const response = await request(server)
        .patch(`/periods/${period._id.toString() as string}/assignQuantifiers`)
        .set('Authorization', `Bearer ${users[0].accessToken}`)
        .send()
        .expect('Content-Type', /json/)
        .expect(200);

      const p = response.body;
      expect(p._id).toEqual(period._id.toString());
      expect(p.status).toEqual('QUANTIFY');
      expect(p.numberOfPraise).toEqual(praiseItems.length);
      expect(p.quantifiers).toHaveLength(quantifiers.length);
      expect(p.quantifiers[0].praiseCount).toEqual(praiseItems.length);
      expect(p.quantifiers[1].praiseCount).toEqual(praiseItems.length);
      expect(p.quantifiers[2].praiseCount).toEqual(praiseItems.length);
      expect(p).toBeProperlySerialized();
      expect(p).toBeValidClass(Period);
    });

    test('404 response if periodId does not exist', async function () {
      return await request(server)
        .patch(`/periods/5f5d5f5d5f5d5f5d5f5d5f5d/assignQuantifiers`)
        .set('Authorization', `Bearer ${users[0].accessToken}`)
        .send()
        .expect('Content-Type', /json/)
        .expect(404);
    });

    test('400 response if period is not OPEN', async function () {
      const period = await periodsSeeder.seedPeriod({ status: 'QUANTIFY' });

      return await request(server)
        .patch(`/periods/${period._id.toString() as string}/assignQuantifiers`)
        .set('Authorization', `Bearer ${users[0].accessToken}`)
        .send()
        .expect('Content-Type', /json/)
        .expect(400);
    });

    test('400 response if period endDate is in the future', async function () {
      const period = await periodsSeeder.seedPeriod({
        status: 'QUANTIFY',
        endDate: faker.date.future(),
      });

      return await request(server)
        .patch(`/periods/${period._id.toString() as string}/assignQuantifiers`)
        .set('Authorization', `Bearer ${users[0].accessToken}`)
        .send()
        .expect('Content-Type', /json/)
        .expect(400);
    });

    test('400 response if praise has already been assigned for the period', async function () {
      const period = await periodsSeeder.seedPeriod({ status: 'QUANTIFY' });

      await request(server)
        .patch(`/periods/${period._id.toString() as string}/assignQuantifiers`)
        .set('Authorization', `Bearer ${users[0].accessToken}`)
        .send()
        .expect('Content-Type', /json/);

      return await request(server)
        .patch(`/periods/${period._id.toString() as string}/assignQuantifiers`)
        .set('Authorization', `Bearer ${users[0].accessToken}`)
        .send()
        .expect('Content-Type', /json/)
        .expect(400);
    });

    test('403 response if user is not ADMIN', async function () {
      const period = await periodsSeeder.seedPeriod();

      return await request(server)
        .patch(`/periods/${period._id.toString() as string}/assignQuantifiers`)
        .set('Authorization', `Bearer ${users[1].accessToken}`)
        .send()
        .expect('Content-Type', /json/)
        .expect(403);
    });

    test('401 response with json body if user not authenticated', async function () {
      const period = await periodsSeeder.seedPeriod();

      return await request(server)
        .patch(`/periods/${period._id.toString() as string}/assignQuantifiers`)
        .send()
        .expect('Content-Type', /json/)
        .expect(401);
    });
  });

  describe('PATCH /api/admin/periods/:periodId/replaceQuantifier', () => {
    beforeEach(async () => {
      await periodsService.getModel().deleteMany({});
      await praiseService.getModel().deleteMany({});
      await quantificationsService.getModel().deleteMany({});
      await userAccountsService.getModel().deleteMany({});
    });

    it('200 response with json body containing period and affected praises', async function () {
      const receiver1 = await userAccountsSeeder.seedUserAccount();

      const period = await periodsSeeder.seedPeriod({
        status: 'QUANTIFY',
      });

      const dayInPeriod = new Date(period.endDate.getTime());
      dayInPeriod.setDate(period.endDate.getDate() - 1);

      const praise1 = await praiseSeeder.seedPraise({
        receiver: receiver1._id,
        createdAt: dayInPeriod,
      });
      const praise2 = await praiseSeeder.seedPraise({
        receiver: receiver1._id,
        createdAt: dayInPeriod,
      });
      const praise3 = await praiseSeeder.seedPraise({
        receiver: receiver1._id,
        createdAt: dayInPeriod,
      });

      const originalQuantifier = await usersSeeder.seedUser({
        roles: [AuthRole.USER, AuthRole.QUANTIFIER],
      });
      const newQuantifier = await usersSeeder.seedUser({
        roles: [AuthRole.USER, AuthRole.QUANTIFIER],
      });

      await quantificationsSeeder.seedQuantification({
        praise: praise1._id,
        quantifier: originalQuantifier._id,
        createdAt: dayInPeriod,
      });
      await quantificationsSeeder.seedQuantification({
        praise: praise2._id,
        quantifier: originalQuantifier._id,
        createdAt: dayInPeriod,
      });
      await quantificationsSeeder.seedQuantification({
        praise: praise3._id,
        quantifier: originalQuantifier._id,
        createdAt: dayInPeriod,
      });

      const FORM_DATA = {
        currentQuantifierId: originalQuantifier._id.toString(),
        newQuantifierId: newQuantifier._id.toString(),
      };

      const response = await request(server)
        .patch(`/periods/${period._id.toString() as string}/replaceQuantifier`)
        .set('Authorization', `Bearer ${users[0].accessToken}`)
        .send(FORM_DATA)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.period._id).toEqual(period._id.toString());
      expect(response.body.period.quantifiers).toHaveLength(1);

      expect(response.body.period.quantifiers[0]._id).toEqual(
        newQuantifier._id.toString(),
      );
      expect(response.body.period.quantifiers[0].finishedCount).toEqual(0);

      expect(response.body.praises.length).toEqual(3);
      expect(
        some(response.body.praises[0].quantifications, {
          quantifier: newQuantifier._id.toString(),
        }),
      ).toBeTruthy;
      expect(
        some(response.body.praises[1].quantifications, {
          quantifier: newQuantifier._id.toString(),
        }),
      ).toBeTruthy;
      expect(
        some(response.body.praises[2].quantifications, {
          quantifier: newQuantifier._id.toString(),
        }),
      ).toBeTruthy;

      expect(
        some(response.body.praises[0].quantifications, {
          quantifier: originalQuantifier._id.toString(),
        }),
      ).toBeFalsy;
      expect(
        some(response.body.praises[1].quantifications, {
          quantifier: originalQuantifier._id.toString(),
        }),
      ).toBeFalsy;
      expect(
        some(response.body.praises[2].quantifications, {
          quantifier: originalQuantifier._id.toString(),
        }),
      ).toBeFalsy;
    });

    test('404 response if periodId does not exist', async function () {
      const originalQuantifier = await usersSeeder.seedUser({
        roles: [AuthRole.USER, AuthRole.QUANTIFIER],
      });
      const newQuantifier = await usersSeeder.seedUser({
        roles: [AuthRole.USER, AuthRole.QUANTIFIER],
      });

      const FORM_DATA = {
        currentQuantifierId: originalQuantifier._id.toString(),
        newQuantifierId: newQuantifier._id.toString(),
      };

      return await request(server)
        .patch(`/periods/5f5d5f5d5f5d5f5d5f5d5f5d/replaceQuantifier`)
        .set('Authorization', `Bearer ${users[0].accessToken}`)
        .set('Accept', 'application/json')
        .send(FORM_DATA)
        .expect('Content-Type', /json/)
        .expect(404);
    });

    test('400 response if period is not QUANTIFY', async function () {
      const period = await periodsSeeder.seedPeriod({ status: 'OPEN' });
      const originalQuantifier = await usersSeeder.seedUser({
        roles: [AuthRole.USER, AuthRole.QUANTIFIER],
      });
      const newQuantifier = await usersSeeder.seedUser({
        roles: [AuthRole.USER, AuthRole.QUANTIFIER],
      });

      const FORM_DATA = {
        currentQuantifierId: originalQuantifier._id.toString(),
        newQuantifierId: newQuantifier._id.toString(),
      };

      return await request(server)
        .patch(`/periods/${period._id.toString() as string}/replaceQuantifier`)
        .set('Authorization', `Bearer ${users[0].accessToken}`)
        .set('Accept', 'application/json')
        .send(FORM_DATA)
        .expect('Content-Type', /json/)
        .expect(400);
    });

    test('400 response if missing currentQuantifierId', async function () {
      const period = await periodsSeeder.seedPeriod({ status: 'OPEN' });
      const newQuantifier = await usersSeeder.seedUser({
        roles: [AuthRole.USER, AuthRole.QUANTIFIER],
      });

      const FORM_DATA = {
        newQuantifierId: newQuantifier._id.toString(),
      };

      return await request(server)
        .patch(`/periods/${period._id.toString() as string}/replaceQuantifier`)
        .set('Authorization', `Bearer ${users[0].accessToken}`)
        .set('Accept', 'application/json')
        .send(FORM_DATA)
        .expect('Content-Type', /json/)
        .expect(400);
    });

    test('400 response if missing newQuantifierId', async function () {
      const period = await periodsSeeder.seedPeriod({ status: 'OPEN' });
      const originalQuantifier = await usersSeeder.seedUser({
        roles: [AuthRole.USER, AuthRole.QUANTIFIER],
      });

      const FORM_DATA = {
        currentQuantifierId: originalQuantifier._id.toString(),
      };

      return await request(server)
        .patch(`/periods/${period._id.toString() as string}/replaceQuantifier`)
        .set('Authorization', `Bearer ${users[0].accessToken}`)
        .set('Accept', 'application/json')
        .send(FORM_DATA)
        .expect('Content-Type', /json/)
        .expect(400);
    });

    test('400 response currentQuantifierId is same as newQuantifierId', async function () {
      const period = await periodsSeeder.seedPeriod({ status: 'OPEN' });
      const originalQuantifier = await usersSeeder.seedUser({
        roles: [AuthRole.USER, AuthRole.QUANTIFIER],
      });

      const FORM_DATA = {
        currentQuantifierId: originalQuantifier._id.toString(),
        newQuantifierId: originalQuantifier._id.toString(),
      };

      return await request(server)
        .patch(`/periods/${period._id.toString() as string}/replaceQuantifier`)
        .set('Authorization', `Bearer ${users[0].accessToken}`)
        .set('Accept', 'application/json')
        .send(FORM_DATA)
        .expect('Content-Type', /json/)
        .expect(400);
    });

    test('400 response if original user does not exist', async function () {
      const period = await periodsSeeder.seedPeriod({ status: 'OPEN' });
      const newQuantifier = await usersSeeder.seedUser({
        roles: [AuthRole.USER, AuthRole.QUANTIFIER],
      });

      const FORM_DATA = {
        currentQuantifierId: '5f5d5f5d5f5d5f5d5f5d5f5d',
        newQuantifierId: newQuantifier._id.toString(),
      };

      return await request(server)
        .patch(`/periods/${period._id.toString() as string}/replaceQuantifier`)
        .set('Authorization', `Bearer ${users[0].accessToken}`)
        .set('Accept', 'application/json')
        .send(FORM_DATA)
        .expect('Content-Type', /json/)
        .expect(400);
    });

    test('400 response if replacement user does not exist', async function () {
      const period = await periodsSeeder.seedPeriod({ status: 'OPEN' });
      const originalQuantifier = await usersSeeder.seedUser({
        roles: [AuthRole.USER, AuthRole.QUANTIFIER],
      });

      const FORM_DATA = {
        currentQuantifierId: originalQuantifier._id.toString(),
        newQuantifierId: '5f5d5f5d5f5d5f5d5f5d5f5d',
      };

      return await request(server)
        .patch(`/periods/${period._id.toString() as string}/replaceQuantifier`)
        .set('Authorization', `Bearer ${users[0].accessToken}`)
        .set('Accept', 'application/json')
        .send(FORM_DATA)
        .expect('Content-Type', /json/)
        .expect(400);
    });

    test('400 response if replacement user is not a QUANTIFIER', async function () {
      const period = await periodsSeeder.seedPeriod({ status: 'OPEN' });
      const originalQuantifier = await usersSeeder.seedUser({
        roles: [AuthRole.USER, AuthRole.QUANTIFIER],
      });
      const newQuantifier = await usersSeeder.seedUser({
        roles: [AuthRole.USER],
      });

      const FORM_DATA = {
        currentQuantifierId: originalQuantifier._id.toString(),
        newQuantifierId: newQuantifier._id.toString(),
      };

      return await request(server)
        .patch(`/periods/${period._id.toString() as string}/replaceQuantifier`)
        .set('Authorization', `Bearer ${users[0].accessToken}`)
        .set('Accept', 'application/json')
        .send(FORM_DATA)
        .expect('Content-Type', /json/)
        .expect(400);
    });

    test('400 response if replacement user is already assigned to some of the same praise as original', async function () {
      const period = await periodsSeeder.seedPeriod({ status: 'OPEN' });
      const originalQuantifier = await usersSeeder.seedUser({
        roles: [AuthRole.USER, AuthRole.QUANTIFIER],
      });
      const newQuantifier = await usersSeeder.seedUser({
        roles: [AuthRole.USER, AuthRole.QUANTIFIER],
      });

      const previousDay = new Date(period.endDate.getTime());
      previousDay.setDate(period.endDate.getDate() - 5);

      const receiver1 = await userAccountsSeeder.seedUserAccount();
      const praise1 = await praiseSeeder.seedPraise({
        receiver: receiver1._id,
        createdAt: previousDay,
      });
      const praise2 = await praiseSeeder.seedPraise({
        receiver: receiver1._id,
        createdAt: previousDay,
      });
      const praise3 = await praiseSeeder.seedPraise({
        receiver: receiver1._id,
        createdAt: previousDay,
      });

      await quantificationsSeeder.seedQuantification({
        praise: praise1._id,
        quantifier: originalQuantifier._id,
      });
      await quantificationsSeeder.seedQuantification({
        praise: praise2._id,
        quantifier: originalQuantifier._id,
      });
      await quantificationsSeeder.seedQuantification({
        praise: praise3._id,
        quantifier: originalQuantifier._id,
      });

      await quantificationsSeeder.seedQuantification({
        praise: praise1._id,
        quantifier: newQuantifier._id,
      });

      const FORM_DATA = {
        currentQuantifierId: originalQuantifier._id.toString(),
        newQuantifierId: newQuantifier._id.toString(),
      };

      return await request(server)
        .patch(`/periods/${period._id.toString() as string}/replaceQuantifier`)
        .set('Authorization', `Bearer ${users[0].accessToken}`)
        .set('Accept', 'application/json')
        .send(FORM_DATA)
        .expect('Content-Type', /json/)
        .expect(400);
    });

    test('403 response if user is not ADMIN', async function () {
      const period = await periodsSeeder.seedPeriod({ status: 'OPEN' });
      const originalQuantifier = await usersSeeder.seedUser({
        roles: [AuthRole.USER, AuthRole.QUANTIFIER],
      });
      const newQuantifier = await usersSeeder.seedUser({
        roles: [AuthRole.USER, AuthRole.QUANTIFIER],
      });

      const FORM_DATA = {
        currentQuantifierId: originalQuantifier._id.toString(),
        newQuantifierId: newQuantifier._id.toString(),
      };

      return await request(server)
        .patch(`/periods/${period._id.toString() as string}/replaceQuantifier`)
        .set('Authorization', `Bearer ${users[0].accessToken}`)
        .set('Accept', 'application/json')
        .send(FORM_DATA)
        .expect('Content-Type', /json/)
        .expect(400);
    });

    test('401 response if user is not authenticated', async function () {
      const period = await periodsSeeder.seedPeriod({ status: 'OPEN' });
      const originalQuantifier = await usersSeeder.seedUser({
        roles: [AuthRole.USER, AuthRole.QUANTIFIER],
      });
      const newQuantifier = await usersSeeder.seedUser({
        roles: [AuthRole.USER, AuthRole.QUANTIFIER],
      });

      const FORM_DATA = {
        currentQuantifierId: originalQuantifier._id.toString(),
        newQuantifierId: newQuantifier._id.toString(),
      };

      return await request(server)
        .patch(`/periods/${period._id.toString() as string}/replaceQuantifier`)
        .set('Accept', 'application/json')
        .send(FORM_DATA)
        .expect('Content-Type', /json/)
        .expect(401);
    });
  });
});
