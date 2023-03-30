import './shared/jest';
import request from 'supertest';
import { Wallet } from 'ethers';
import {
  authorizedGetRequest,
  authorizedPatchRequest,
  loginUser,
} from './shared/request';
import { Period } from '../src/periods/schemas/periods.schema';
import { PeriodStatusType } from '../src/periods/enums/status-type.enum';
import { PeriodSetting } from '../src/settings/schemas/periodsettings.schema';
import { AuthRole } from '../src/auth/enums/auth-role.enum';
import { User } from '../src/users/schemas/users.schema';
import { Setting } from '../src/settings/schemas/settings.schema';
import {
  app,
  testingModule,
  server,
  usersService,
  usersSeeder,
  periodsSeeder,
  settingsSeeder,
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

describe('Period Settings (E2E)', () => {
  const users: LoggedInUser[] = [];

  beforeAll(async () => {
    // Clear the database
    await settingsService.getSettingsModel().deleteMany({});
    await usersService.getModel().deleteMany({});
    await periodsService.getModel().deleteMany({});
    await periodSettingsService.getModel().deleteMany({});

    // Seed and login 2 users
    for (let i = 0; i < 2; i++) {
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

    // SEED the admin user
    const wallet = Wallet.createRandom();
    const user = await usersSeeder.seedUser({
      identityEthAddress: wallet.address,
      rewardsAddress: wallet.address,
      roles: [AuthRole.ADMIN],
    });
    const response = await loginUser(app, testingModule, wallet);
    users.push({
      accessToken: response.accessToken,
      user,
      wallet,
    });
  });

  describe('GET /api/periods/{periodId}/settings', () => {
    let period: Period;
    let period2: Period;
    let setting: Setting;
    let periodSetting: PeriodSetting;

    beforeEach(async () => {
      period = await periodsSeeder.seedPeriod({
        status: PeriodStatusType.OPEN,
      });

      setting = await settingsSeeder.seedSettings({
        key: 'PRAISE_SUCCESS_MESSAGE',
        value: '✅ Praise {@receivers} {reason}',
        type: 'String',
      });

      periodSetting = await periodSettingsSeeder.seedPeriodSettings({
        period: period,
        setting: setting,
        value: '✅ Praise {@receivers} {reason}',
        type: 'String',
      });

      period2 = await periodsSeeder.seedPeriod({
        status: PeriodStatusType.OPEN,
      });

      await periodSettingsSeeder.seedPeriodSettings({
        period: period2,
        setting: setting,
        value: '✅ Praise {@receivers} {reason}',
        type: 'String',
      });
    });

    test('401 when not authenticated', async () => {
      return request(server)
        .get(`/periods/${period._id}/settings`)
        .send()
        .expect(401);
    });

    test('200 when correct data is sent', async () => {
      const response = await authorizedGetRequest(
        `/periods/${period._id}/settings`,
        app,
        users[0].accessToken,
      );
      expect(response.status).toBe(200);

      const ps = response.body;
      expect(ps).toBeProperlySerialized();
      expect(ps).toBeValidClass(PeriodSetting);
    });

    it('should return the all periodSettings for a given period', async () => {
      const response = await authorizedGetRequest(
        `/periods/${period._id}/settings`,
        app,
        users[0].accessToken,
      ).expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.length).toBe(1);
      expect(response.body[0]).toBeDefined();
      expect(response.body[0]._id).toBe(periodSetting._id.toString());
      expect(response.body[0].value).toBe(periodSetting.value);
      expect(response.body[0].period).toBeDefined();
      expect(response.body[0].period.name).toBe(period.name);
      expect(response.body[0].setting).toBeDefined();
      expect(response.body[0].setting.key).toBe(setting.key);

      const ps = response.body[0];
      expect(ps).toBeProperlySerialized();
      expect(ps).toBeValidClass(PeriodSetting);
    });
  });

  describe('GET /api/periods/{periodId}/settings/{settingId}', () => {
    let period: Period;
    let setting: Setting;
    let periodSetting: PeriodSetting;

    beforeEach(async () => {
      period = await periodsSeeder.seedPeriod({
        status: PeriodStatusType.OPEN,
      });

      setting = await settingsSeeder.seedSettings({
        key: 'PRAISE_SUCCESS_MESSAGE',
        value: '✅ Praise {@receivers} {reason}',
        type: 'String',
      });

      periodSetting = await periodSettingsSeeder.seedPeriodSettings({
        period: period,
        setting: setting,
        value: '✅ Praise {@receivers} {reason}',
        type: 'String',
      });
    });

    test('401 when not authenticated', async () => {
      return request(server)
        .get(`/periods/${period._id}/settings/${setting._id}`)
        .send()
        .expect(401);
    });

    test('200 when correct data is sent', async () => {
      const response = await authorizedGetRequest(
        `/periods/${period._id}/settings/${setting._id}`,
        app,
        users[0].accessToken,
      );

      expect(response.status).toBe(200);

      const ps = response.body;
      expect(ps).toBeDefined();
      expect(ps).toBeDefined();
      expect(ps._id).toBe(periodSetting._id.toString());
      expect(ps.value).toBe(periodSetting.value);
      expect(ps.period).toBeDefined();
      expect(ps.period.name).toBe(period.name);
      expect(ps.setting).toBeDefined();
      expect(ps.setting.key).toBe(setting.key);

      expect(ps).toBeProperlySerialized();
      expect(ps).toBeValidClass(PeriodSetting);
    });
  });

  describe('PUT /api/periods/{periodId}/settings/{settingId}', () => {
    let period: Period;
    let setting: Setting;

    beforeEach(async () => {
      period = await periodsSeeder.seedPeriod({
        status: PeriodStatusType.OPEN,
      });

      setting = await settingsSeeder.seedSettings({
        key: 'PRAISE_SUCCESS_MESSAGE',
        value: '✅ Praise {@receivers} {reason}',
        type: 'String',
      });

      await periodSettingsSeeder.seedPeriodSettings({
        period: period,
        setting: setting,
        value: '✅ Praise {@receivers} {reason}',
        type: 'String',
      });
    });

    test('401 when not authenticated', async () => {
      return request(server)
        .patch(`/periods/${period._id}/settings/${setting._id}`)
        .send()
        .expect(401);
    });

    test('403 when user has no permission to edit', async () => {
      const response = await authorizedPatchRequest(
        `/periods/${period._id}/settings/${setting._id}`,
        app,
        users[0].accessToken,
        {},
      );

      expect(response.status).toBe(403);
    });

    test('Invalid periodSettings parameters - no parameters', async () => {
      const response = await authorizedPatchRequest(
        `/periods/${period._id}/settings/${setting._id}`,
        app,
        users[2].accessToken, // admin
        {},
      );

      expect(response.status).toBe(400);
    });

    test('Update periodSetting value with correct parameters', async () => {
      const newValue = 'Praise Text';
      const response = await authorizedPatchRequest(
        `/periods/${period._id}/settings/${setting._id}`,
        app,
        users[2].accessToken,
        {
          value: newValue,
        },
      );

      expect(response.status).toBe(200);

      const ps = response.body;
      expect(ps).toBeDefined();
      expect(ps.value).toBe(newValue);
      expect(ps).toBeProperlySerialized();
      expect(ps).toBeValidClass(PeriodSetting);
    });

    test('Invalid settings value - Integer', async () => {
      const value = '99';
      const s = await settingsSeeder.seedSettings({
        key: 'INT_SETTING',
        value,
        type: 'Integer',
      });

      await periodSettingsSeeder.seedPeriodSettings({
        period: period,
        setting: s,
        value,
      });

      const newValue = 'not an integer'; // invalid value
      const response = await authorizedPatchRequest(
        `/periods/${period._id}/settings/${s._id}`,
        app,
        users[2].accessToken,
        {
          value: newValue,
        },
      );

      expect(response.status).toBe(400);
    });

    test('Valid settings value - Integer', async () => {
      const value = 99;
      const s = await settingsSeeder.seedSettings({
        key: 'INT_SETTING',
        value,
        type: 'Integer',
      });

      await periodSettingsSeeder.seedPeriodSettings({
        period: period,
        setting: s,
        value,
      });

      const newValue = 100; // valid value
      const response = await authorizedPatchRequest(
        `/periods/${period._id}/settings/${s._id}`,
        app,
        users[2].accessToken,
        {
          value: newValue.toString(),
        },
      );

      expect(response.status).toBe(200);

      const ps = response.body;
      expect(ps).toBeDefined();
      expect(ps.value).toBe(newValue.toString());
      expect(ps).toBeProperlySerialized();
      expect(ps).toBeValidClass(PeriodSetting);
    });

    test('Invalid settings value - Float', async () => {
      const value = '99.99';
      const s = await settingsSeeder.seedSettings({
        key: 'FLOAT_SETTING',
        value,
        type: 'Float',
      });

      await periodSettingsSeeder.seedPeriodSettings({
        period: period,
        setting: s,
        value,
      });

      const newValue = 'not a float'; // invalid value
      const response = await authorizedPatchRequest(
        `/periods/${period._id}/settings/${s._id}`,
        app,
        users[2].accessToken,
        {
          value: newValue,
        },
      );

      expect(response.status).toBe(400);
    });

    test('Valid settings value - Float', async () => {
      const value = '99.99';
      const s = await settingsSeeder.seedSettings({
        key: 'FLOAT_SETTING',
        value,
        type: 'Float',
      });

      await periodSettingsSeeder.seedPeriodSettings({
        period: period,
        setting: s,
        value,
      });

      const newValue = 100.99; // valid value
      const response = await authorizedPatchRequest(
        `/periods/${period._id}/settings/${s._id}`,
        app,
        users[2].accessToken,
        {
          value: newValue.toString(),
        },
      );

      expect(response.status).toBe(200);

      const ps = response.body;
      expect(ps).toBeDefined();
      expect(ps.value).toBe(newValue.toString());
      expect(ps).toBeProperlySerialized();
      expect(ps).toBeValidClass(PeriodSetting);
    });

    test('Invalid settings value - Boolean', async () => {
      const value = true;
      const s = await settingsSeeder.seedSettings({
        key: 'BOOL_SETTING',
        value,
        type: 'Boolean',
      });

      await periodSettingsSeeder.seedPeriodSettings({
        period: period,
        setting: s,
        value,
      });

      const newValue = 'not a boolean'; // invalid value
      const response = await authorizedPatchRequest(
        `/periods/${period._id}/settings/${s._id}`,
        app,
        users[2].accessToken,
        {
          value: newValue,
        },
      );

      expect(response.status).toBe(400);
    });

    test('Valid settings value - Boolean', async () => {
      const value = true;
      const s = await settingsSeeder.seedSettings({
        key: 'BOOL_SETTING',
        value,
        type: 'Boolean',
      });

      await periodSettingsSeeder.seedPeriodSettings({
        period: period,
        setting: s,
        value,
      });

      const newValue = false; // valid value
      const response = await authorizedPatchRequest(
        `/periods/${period._id}/settings/${s._id}`,
        app,
        users[2].accessToken,
        {
          value: newValue.toString(),
        },
      );

      expect(response.status).toBe(200);

      const ps = response.body;
      expect(ps).toBeDefined();
      expect(ps.value).toBe(newValue.toString());
      expect(ps).toBeProperlySerialized();
      expect(ps).toBeValidClass(PeriodSetting);
    });

    test('Invalid settings value - IntegerList', async () => {
      const value = '1, 2, 3';
      const s = await settingsSeeder.seedSettings({
        key: 'INT_LIST_SETTING',
        value,
        type: 'IntegerList',
      });

      await periodSettingsSeeder.seedPeriodSettings({
        period: period,
        setting: s,
        value,
      });

      const newValue = 'not an integer list'; // invalid value
      const response = await authorizedPatchRequest(
        `/periods/${period._id}/settings/${s._id}`,
        app,
        users[2].accessToken,
        {
          value: newValue,
        },
      );

      expect(response.status).toBe(400);
    });

    test('Valid settings value - IntegerList', async () => {
      const value = '1, 2, 3';
      const s = await settingsSeeder.seedSettings({
        key: 'INT_LIST_SETTING',
        value,
        type: 'IntegerList',
      });

      await periodSettingsSeeder.seedPeriodSettings({
        period: period,
        setting: s,
        value,
      });

      const newValue = '4, 5, 6'; // valid value
      const response = await authorizedPatchRequest(
        `/periods/${period._id}/settings/${s._id}`,
        app,
        users[2].accessToken,
        {
          value: newValue,
        },
      );

      expect(response.status).toBe(200);

      const ps = response.body;
      expect(ps).toBeDefined();
      expect(ps.value).toBe('4,5,6');
      expect(ps).toBeProperlySerialized();
      expect(ps).toBeValidClass(PeriodSetting);
    });

    test('Invalid settings value - JSON', async () => {
      const value = '{"key": "value"}';
      const s = await settingsSeeder.seedSettings({
        key: 'JSON_SETTING',
        value,
        type: 'JSON',
      });

      await periodSettingsSeeder.seedPeriodSettings({
        period: period,
        setting: s,
        value,
      });

      const newValue = 'not a JSON'; // invalid value
      const response = await authorizedPatchRequest(
        `/periods/${period._id}/settings/${s._id}`,
        app,
        users[2].accessToken,
        {
          value: newValue,
        },
      );

      expect(response.status).toBe(400);
    });

    test('Valid settings value - JSON', async () => {
      const value = '{"key": "value"}';
      const s = await settingsSeeder.seedSettings({
        key: 'JSON_SETTING',
        value,
        type: 'JSON',
      });

      await periodSettingsSeeder.seedPeriodSettings({
        period: period,
        setting: s,
        value,
      });

      const newValue = '{"key": "new value"}'; // valid value
      const response = await authorizedPatchRequest(
        `/periods/${period._id}/settings/${s._id}`,
        app,
        users[2].accessToken,
        {
          value: newValue,
        },
      );

      expect(response.status).toBe(200);

      const ps = response.body;
      expect(ps).toBeDefined();

      const newValueObj = JSON.parse(newValue);
      const responseValueObj = JSON.parse(response.body.value);
      expect(responseValueObj).toMatchObject(newValueObj);

      expect(ps).toBeProperlySerialized();
      expect(ps).toBeValidClass(PeriodSetting);
    });
  });
});
