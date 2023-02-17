import request from 'supertest';
import {
  ConsoleLogger,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { Server } from 'http';
import { Wallet } from 'ethers';
import { ServiceExceptionFilter } from '@/shared/filters/service-exception.filter';
import { UsersService } from '@/users/users.service';
import { UsersModule } from '@/users/users.module';
import { UsersSeeder } from '@/database/seeder/users.seeder';
import {
  authorizedGetRequest,
  authorizedPatchRequest,
  authorizedPostRequest,
  loginUser,
} from './test.common';
import { runDbMigrations } from '@/database/migrations';
import { PraiseModule } from '@/praise/praise.module';
import { QuantificationsModule } from '@/quantifications/quantifications.module';
import { UserAccountsModule } from '@/useraccounts/useraccounts.module';
import { PeriodsService } from '../src/periods/services/periods.service';
import { PraiseSeeder } from '@/database/seeder/praise.seeder';
import { QuantificationsSeeder } from '@/database/seeder/quantifications.seeder';
import { UserAccountsSeeder } from '@/database/seeder/useraccounts.seeder';
import { PraiseService } from '@/praise/services/praise.service';
import { QuantificationsService } from '@/quantifications/services/quantifications.service';
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
import { PraisePaginatedQueryDto } from '@/praise/dto/praise-paginated-query.dto';
import { Types } from 'mongoose';
import { AuthRole } from '@/auth/enums/auth-role.enum';
import { User } from '@/users/schemas/users.schema';
import { Setting } from '@/settings/schemas/settings.schema';
import { SettingsService } from '@/settings/settings.service';
import { faker } from '@faker-js/faker';
import { seedUser } from '../../api/src/database/seeder/entities';

class LoggedInUser {
  accessToken: string;
  user: User;
  wallet: Wallet;
}

describe('Praise (E2E)', () => {
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
  let settingsService: SettingsService;
  let periodSettingsService: PeriodSettingsService;
  let periodSettingsSeeder: PeriodSettingsSeeder;
  let quantificationsSeeder: QuantificationsSeeder;
  let quantificationsService: QuantificationsService;
  let userAccountsService: UserAccountsService;
  let userAccountsSeeder: UserAccountsSeeder;
  let adminUser: User;
  let adminUserAccessToken: string;
  let botUser: User;
  let botUserAccessToken: string;

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
        whitelist: true,
        forbidNonWhitelisted: true,
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
    userAccountsSeeder = module.get<UserAccountsSeeder>(UserAccountsSeeder);
    settingsSeeder = module.get<SettingsSeeder>(SettingsSeeder);
    settingsService = module.get<SettingsService>(SettingsService);
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
    await settingsService.getModel().deleteMany({});

    // Seed and login 3 users
    for (let i = 0; i < 3; i++) {
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

    // Seed and login admin user
    const wallet = Wallet.createRandom();
    adminUser = await usersSeeder.seedUser({
      identityEthAddress: wallet.address,
      rewardsAddress: wallet.address,
      roles: [AuthRole.ADMIN],
    });

    const response = await loginUser(app, module, wallet);
    adminUserAccessToken = response.accessToken;

    // Seed and login bot user
    const botWallet = Wallet.createRandom();
    const botUser = await usersSeeder.seedUser({
      identityEthAddress: botWallet.address,
      rewardsAddress: botWallet.address,
      roles: [AuthRole.PERMISSION_DISCORD_BOT],
    });

    const responseBot = await loginUser(app, module, botWallet);
    botUserAccessToken = responseBot.accessToken;
  });

  afterAll(async () => {
    await app.close();
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

    test('401 when not authenticated', async () => {
      await request(server).get('/praise/export').send().expect(401);
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
      expect(praise._id).toBe(praise2!._id.toString());
      expect(praise.giver._id).toBe(praise2!.giver.toString());
      expect(praise.receiver._id).toBe(praise2!.receiver.toString());
      expect(praise.reason).toBe(praise2!.reason);
      expect(praise.reasonRaw).toBe(praise2!.reasonRaw);
      expect(praise.score).toBe(praise2!.score);
      expect(praise.sourceId).toBe(praise2!.sourceId);
      expect(praise.sourceName).toBe(praise2!.sourceName);

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
      const response = await loginUser(app, module, walletAuth);
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

  describe('PUT /api/praise/{id}/quantify - multiple quantifications', () => {
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
        endDate: praise.createdAt,
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
      expect(p.quantifications.length).toBe(3);
      expect(p.score).toBe(76);

      expect(p).toBeProperlySerialized();
      // expect(p).toBeValidClass(Praise);
    });

    test('Quantifying multiple praise - scores and averages correct - with duplicates and dismissed', async () => {
      // Seed duplicate praise
      const praise2 = await praiseSeeder.seedPraise();

      // Seed a quantification for duplicate praise, quantifier 3
      await quantificationsSeeder.seedQuantification({
        quantifier: users[2].user._id,
        praise: praise2._id,
      });

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
      // Give score to duplicate praise
      await authorizedPatchRequest(
        `/praise/${praise2._id}/quantify`,
        app,
        users[2].accessToken,
        {
          score: 144,
        },
      );
      // Mark second quantification as duplicate
      await authorizedPatchRequest(
        `/praise/${praise._id}/quantify`,
        app,
        users[2].accessToken,
        {
          duplicatePraiseId: praise2._id.toString(),
        },
      );

      const response = await authorizedGetRequest(
        `/praise/${praise._id}`,
        app,
        users[0].accessToken,
      );

      expect(response.status).toBe(200);

      const p = response.body;
      expect(p).toBeDefined();
      expect(p.score).toBe(11.2);
      expect(p.quantifications.length).toBe(3);
      const duplicateQuant = p.quantifications.find(
        (q: { duplicatePraise: string }) =>
          q.duplicatePraise === praise2._id.toString(),
      );
      expect(duplicateQuant).toBeDefined();
      expect(duplicateQuant.scoreRealized).toBe(14.4);

      expect(p).toBeProperlySerialized();
      // expect(p).toBeValidClass(Praise);
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

    test('403 when authenticated as user', async () => {
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

    test('400 when authenticated as bot', async () => {
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
      expect(response.body.message).toBe(
        'This praise giver account is not activated.',
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

    test('400 when forwarder is sent', async () => {
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

      console.log('rb', rb);

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

    test.only('400 when wrong forwarder data is send', async () => {
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
