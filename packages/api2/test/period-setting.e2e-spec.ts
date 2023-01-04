import * as request from 'supertest';
import {
  ConsoleLogger,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { Server } from 'http';
import { Wallet } from 'ethers';
import { ServiceExceptionFilter } from '@/shared/service-exception.filter';
import { UsersService } from '@/users/users.service';
import { UsersModule } from '@/users/users.module';
import { UsersSeeder } from '@/database/seeder/users.seeder';
import {
  authorizedGetRequest,
  authorizedPutRequest,
  loginUser,
} from './test.common';
import { runDbMigrations } from '@/database/migrations';
import { PraiseModule } from '@/praise/praise.module';
import { QuantificationsModule } from '@/quantifications/quantifications.module';
import { UserAccountsModule } from '@/useraccounts/useraccounts.module';
import { PeriodsService } from '../src/periods/periods.service';
import { PraiseSeeder } from '@/database/seeder/praise.seeder';
import { QuantificationsSeeder } from '@/database/seeder/quantifications.seeder';
import { UserAccountsSeeder } from '@/database/seeder/useraccounts.seeder';
import { PraiseService } from '@/praise/praise.service';
import { QuantificationsService } from '@/quantifications/quantifications.service';
import { Praise } from '@/praise/schemas/praise.schema';
import { UserAccountsService } from '@/useraccounts/useraccounts.service';
import { PeriodsSeeder } from '@/database/seeder/periods.seeder';
import { PeriodsModule } from '@/periods/periods.module';
import { Period } from '@/periods/schemas/periods.schema';
import { PeriodStatusType } from '@/periods/enums/status-type.enum';
import { PeriodSettingsModule } from '@/periodsettings/periodsettings.module';
import { PeriodSettingsSeeder } from '@/database/seeder/periodsettings.seeder';
import { PeriodSettingsService } from '@/periodsettings/periodsettings.service';
import { SettingsSeeder } from '@/database/seeder/settings.seeder';
import { SettingsModule } from '@/settings/settings.module';
import { PeriodSetting } from '@/periodsettings/schemas/periodsettings.schema';
import { FindAllPraisePaginatedQuery } from '@/praise/dto/find-all-praise-paginated-query.dto';
import { Types } from 'mongoose';
import { AuthRole } from '@/auth/enums/auth-role.enum';
import { User } from '@/users/schemas/users.schema';
import { Setting } from '@/settings/schemas/settings.schema';
import { SettingsService } from '@/settings/settings.service';

class LoggedInUser {
  accessToken: string;
  user: User;
  wallet: Wallet;
}

describe('Period Setting (E2E)', () => {
  let app: INestApplication;
  let server: Server;
  let module: TestingModule;
  let usersSeeder: UsersSeeder;
  let usersService: UsersService;
  let praiseSeeder: PraiseSeeder;
  let praiseService: PraiseService;
  let periodsService: PeriodsService;
  let periodsSeeder: PeriodsSeeder;
  let settingsSeeder: SettingsSeeder;
  let periodSettingsService: PeriodSettingsService;
  let periodSettingsSeeder: PeriodSettingsSeeder;
  let quantificationsSeeder: QuantificationsSeeder;
  let quantificationsService: QuantificationsService;
  let userAccountsService: UserAccountsService;

  const users: LoggedInUser[] = [];

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        AppModule,
        UsersModule,
        PraiseModule,
        QuantificationsModule,
        UserAccountsModule,
        PeriodsModule,
        PeriodSettingsModule,
        SettingsModule,
      ],
      providers: [
        UsersSeeder,
        PraiseSeeder,
        QuantificationsSeeder,
        UserAccountsSeeder,
        PeriodsSeeder,
        PeriodSettingsSeeder,
        SettingsSeeder,
      ],
    }).compile();

    app = module.createNestApplication();
    app.useLogger(new ConsoleLogger());
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
      }),
    );
    app.useGlobalFilters(new ServiceExceptionFilter());
    server = app.getHttpServer();
    await app.init();
    await runDbMigrations(app);

    usersSeeder = module.get<UsersSeeder>(UsersSeeder);
    usersService = module.get<UsersService>(UsersService);
    praiseSeeder = module.get<PraiseSeeder>(PraiseSeeder);
    praiseService = module.get<PraiseService>(PraiseService);
    quantificationsSeeder = module.get<QuantificationsSeeder>(
      QuantificationsSeeder,
    );
    quantificationsService = module.get<QuantificationsService>(
      QuantificationsService,
    );
    userAccountsService = module.get<UserAccountsService>(UserAccountsService);
    settingsSeeder = module.get<SettingsSeeder>(SettingsSeeder)
    periodsSeeder = module.get<PeriodsSeeder>(PeriodsSeeder);
    periodsService = module.get<PeriodsService>(PeriodsService);
    periodSettingsSeeder =
      module.get<PeriodSettingsSeeder>(PeriodSettingsSeeder);
    periodSettingsService = module.get<PeriodSettingsService>(
      PeriodSettingsService,
    );

    // Clear the database
    await usersService.getModel().deleteMany({});
    await praiseService.getModel().deleteMany({});
    await quantificationsService.getModel().deleteMany({});
    await userAccountsService.getModel().deleteMany({});
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
      const response = await loginUser(app, module, wallet);
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
    const response = await loginUser(app, module, wallet);
    users.push({
      accessToken: response.accessToken,
      user,
      wallet,
    });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/period/{periodId}/settings', () => {
    let period: Period;
    let period2: Period;
    let setting: Setting;
    let periodSetting: PeriodSetting;
    let periodSetting2: PeriodSetting;

    beforeEach(async () => {
      period = await periodsSeeder.seedPeriod({
        status: PeriodStatusType.OPEN,
      });

      setting = await settingsSeeder.seedSettings({
        key: 'PRAISE_SUCCESS_MESSAGE',
        value: '✅ Praise {@receivers} {reason}',
        type: 'Textarea',
      });

      periodSetting =
        await periodSettingsSeeder.seedPeriodSettings({
          period: period,
          setting: setting,
          value: '✅ Praise {@receivers} {reason}',
        });

      period2 = await periodsSeeder.seedPeriod({
        status: PeriodStatusType.OPEN,
      });

      periodSetting2 =
        await periodSettingsSeeder.seedPeriodSettings({
          period: period2,
          setting: setting,
          value: '✅ Praise {@receivers} {reason}',
        });
    });

    test('401 when not authenticated', async () => {
      return request(server).get(`/period/${period._id}/settings`).send().expect(401);
    });

    test('200 when correct data is sent', async () => {
      const response = await authorizedGetRequest(
        `/period/${period._id}/settings`,
        app,
        users[0].accessToken,
      );
      expect(response.status).toBe(200);
    });

    it('should return the all periodSettings for a given period', async () => {

      const response = await authorizedGetRequest(
        `/period/${period._id}/settings`,
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
    });
  });

  describe('GET /api/period/{periodId}/settings/{settingId}', () => {
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
        type: 'Textarea',
      });

      periodSetting =
        await periodSettingsSeeder.seedPeriodSettings({
          period: period,
          setting: setting,
          value: '✅ Praise {@receivers} {reason}',
        });
    });

    test('401 when not authenticated', async () => {
      return request(server).get(`/period/${period._id}/settings/${periodSetting._id}`).send().expect(401);
    });

    test('200 when correct data is sent', async () => {
      const response = await authorizedGetRequest(
        `/period/${period._id}/settings/${setting._id}`,
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
    });
  });

  describe('PUT /api/period/{periodId}/settings/{settingId}', () => {
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
        type: 'Textarea',
      });

      periodSetting =
        await periodSettingsSeeder.seedPeriodSettings({
          period: period,
          setting: setting,
          value: '✅ Praise {@receivers} {reason}',
        });
    });

    test('401 when not authenticated', async () => {
      return request(server)
        .put(`/period/${period._id}/settings/${setting._id}`)
        .send()
        .expect(401);
    });

    test('403 when user has no permission to edit', async () => {
      const response = await authorizedPutRequest(
        `/period/${period._id}/settings/${setting._id}`,
        app,
        users[0].accessToken,
        {},
      );

      expect(response.status).toBe(403);
    });

    test('Invalid periodSettings parameters - no parameters', async () => {
      const response = await authorizedPutRequest(
        `/period/${period._id}/settings/${setting._id}`,
        app,
        users[2].accessToken, // admin
        {},
      );

      expect(response.status).toBe(400);
    });

    test('Update periodSetting value with correct parameters', async () => {
      const newValue = 'SUPERRR Praise {@receivers} {reason}';
      const response = await authorizedPutRequest(
        `/period/${period._id}/settings/${setting._id}`,
        app,
        users[2].accessToken,
        {
          value: newValue,
        },
      );

      expect(response.status).toBe(400);
      expect(response.body).toBeDefined();
      expect(response.body.value).toBe(newValue);
    });
  });
});
