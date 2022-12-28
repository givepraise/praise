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
  authorizedPostRequest,
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
import { UserAccount } from '@/useraccounts/schemas/useraccounts.schema';
import { PeriodSetting } from '@/periodsettings/schemas/periodsettings.schema';
import { FindAllPraisePaginatedQuery } from '@/praise/dto/find-all-praise-paginated-query.dto';
import { Types } from 'mongoose';
import { AuthRole } from '@/auth/enums/auth-role.enum';

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
  let periodSettingsService: PeriodSettingsService;
  let periodSettingsSeeder: PeriodSettingsSeeder;
  let quantificationsSeeder: QuantificationsSeeder;
  let quantificationsService: QuantificationsService;
  let userAccountsSeeder: UserAccountsSeeder;
  let userAccountsService: UserAccountsService;
  let wallet;
  let accessToken: string;
  let quantifier: UserAccount;

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
    userAccountsSeeder = module.get<UserAccountsSeeder>(UserAccountsSeeder);
    userAccountsService = module.get<UserAccountsService>(UserAccountsService);
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

    // Seed the database
    wallet = Wallet.createRandom();
    const user = await usersSeeder.seedUser({
      identityEthAddress: wallet.address,
      rewardsAddress: wallet.address,
      roles: [AuthRole.USER, AuthRole.QUANTIFIER],
    });

    quantifier = await userAccountsSeeder.seedUserAccount({
      user: user,
      ethAddress: wallet.address,
    });

    // Login and get access token
    const response = await loginUser(app, module, wallet);
    accessToken = response.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/praise', () => {
    let praise: Praise;

    beforeEach(async () => {
      praise = await praiseSeeder.seedPraise();

      await quantificationsSeeder.seedQuantification({
        quantifier: quantifier,
        score: 0,
        scoreRealized: 0,
        dismissed: false,
        praise: praise,
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
      const response = await authorizedGetRequest('/praise', app, accessToken);
      expect(response.status).toBe(200);
    });

    it('should return the expected pagination object when called with query parameters', async () => {
      //Clear the database
      await praiseService.getModel().deleteMany({});

      // Seed the database with 12 praise items
      for (let i = 0; i < 12; i++) {
        await praiseSeeder.seedPraise();
      }

      const options: FindAllPraisePaginatedQuery = {
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
        accessToken,
      ).expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.docs).toBeDefined();
      expect(response.body.docs.length).toBe(10);
      expect(response.body.totalDocs).toBe(12);
      expect(response.body.page).toBe(1);
      expect(response.body.limit).toBe(10);
      expect(response.body.totalPages).toBe(2);
    });
  });

  describe('GET /api/praise/{id}', () => {
    let praise: Praise;

    beforeEach(async () => {
      praise = await praiseSeeder.seedPraise();

      await quantificationsSeeder.seedQuantification({
        quantifier: quantifier,
        score: 0,
        scoreRealized: 0,
        dismissed: false,
        praise: praise,
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
        accessToken,
      );

      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
    });

    test('400 when praise does not exist', async () => {
      return authorizedGetRequest(
        `/praise/${new Types.ObjectId()}`,
        app,
        accessToken,
      ).expect(400);
    });
  });

  describe('POST /api/praise/{id}/quantify', () => {
    let praise: Praise;
    let period: Period;
    let periodSettingsAllowedValues: PeriodSetting;

    beforeEach(async () => {
      praise = await praiseSeeder.seedPraise();

      await quantificationsSeeder.seedQuantification({
        quantifier: quantifier,
        score: 0,
        scoreRealized: 0,
        dismissed: false,
        praise: praise,
      });

      period = await periodsSeeder.seedPeriod({
        endDate: praise.createdAt,
        status: PeriodStatusType.QUANTIFY,
      });

      periodSettingsAllowedValues =
        await periodSettingsSeeder.seedPeriodSettings({
          period: period,
          key: 'PRAISE_QUANTIFY_ALLOWED_VALUES',
          value: '0, 1, 3, 5, 8, 13, 21, 34, 55, 89, 144',
          type: 'StringList',
        });
    });

    test('401 when not authenticated', async () => {
      return request(server)
        .post(`/praise/${praise._id}/quantify`)
        .send()
        .expect(401);
    });

    test('201 when correct data is sent', async () => {
      const response = await authorizedPostRequest(
        `/praise/${praise._id}/quantify`,
        app,
        accessToken,
        {
          score: 144,
        },
      );

      expect(response.status).toBe(201);
    });

    test('400 when wrong score is sent', async () => {
      const response = await authorizedPostRequest(
        `/praise/${praise._id}/quantify`,
        app,
        accessToken,
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
      return authorizedPostRequest(
        `/praise/${new Types.ObjectId()}/quantify`,
        app,
        accessToken,
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

      return authorizedPostRequest(
        `/praise/${praiseItem._id}/quantify`,
        app,
        accessToken,
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

      return authorizedPostRequest(
        `/praise/${praiseItem._id}/quantify`,
        app,
        accessToken,
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

      return authorizedPostRequest(
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

      return authorizedPostRequest(
        `/praise/${praiseItem._id}/quantify`,
        app,
        accessToken,
        {
          score: 144,
          duplicatePraise: praiseItem._id.toString(),
        },
      ).expect(400);
    });

    test('400 when duplicate praise item not found', async () => {
      const praiseItem = await praiseSeeder.seedPraise();

      await periodsSeeder.seedPeriod({
        endDate: praise.createdAt,
        status: PeriodStatusType.QUANTIFY,
      });

      return authorizedPostRequest(
        `/praise/${praiseItem._id}/quantify`,
        app,
        accessToken,
        {
          score: 144,
          duplicatePraise: new Types.ObjectId().toString(),
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

      return authorizedPostRequest(
        `/praise/${praiseItem._id}/quantify`,
        app,
        accessToken,
        {
          score: 144,
          duplicatePraise: duplicatePraise._id.toString(),
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
        quantifier: quantifier,
        score: 0,
        scoreRealized: 0,
        dismissed: false,
        praise: duplicatePraise,
      });

      return authorizedPostRequest(
        `/praise/${praiseItem._id}/quantify`,
        app,
        accessToken,
        {
          score: 144,
          duplicatePraise: duplicatePraise._id.toString(),
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
        quantifier: quantifier,
        score: 0,
        scoreRealized: 0,
        dismissed: false,
        praise: duplicatePraise,
        duplicatePraise: duplicatePraise._id.toString(),
      });

      return authorizedPostRequest(
        `/praise/${praiseItem._id}/quantify`,
        app,
        accessToken,
        {
          score: 144,
          duplicatePraise: duplicatePraise._id.toString(),
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
        quantifier: quantifier,
        score: 0,
        scoreRealized: 0,
        dismissed: false,
        praise: duplicatePraise,
      });

      return authorizedPostRequest(
        `/praise/${praiseItem._id}/quantify`,
        app,
        accessToken,
        {
          score: 144,
          duplicatePraise: duplicatePraise._id.toString(),
        },
      ).expect(400);
    });
  });

  describe('POST /api/praise/quantify', () => {
    let praise: Praise;
    let period: Period;

    beforeEach(async () => {
      praise = await praiseSeeder.seedPraise();

      await quantificationsSeeder.seedQuantification({
        quantifier: quantifier,
        score: 0,
        scoreRealized: 0,
        dismissed: false,
        praise: praise,
      });

      period = await periodsSeeder.seedPeriod({
        endDate: praise.createdAt,
        status: PeriodStatusType.QUANTIFY,
      });

      await periodSettingsSeeder.seedPeriodSettings({
        period: period,
        key: 'PRAISE_QUANTIFY_ALLOWED_VALUES',
        value: '0, 1, 3, 5, 8, 13, 21, 34, 55, 89, 144',
        type: 'StringList',
      });
    });

    test('401 when not authenticated', async () => {
      return request(server).post(`/praise/quantify`).send().expect(401);
    });

    test('201 when correct data is sent', async () => {
      const praise2 = await praiseSeeder.seedPraise({
        createdAt: praise.createdAt,
      });

      await quantificationsSeeder.seedQuantification({
        quantifier: quantifier,
        score: 0,
        scoreRealized: 0,
        dismissed: false,
        praise: praise2,
      });

      const response = await authorizedPostRequest(
        `/praise/quantify`,
        app,
        accessToken,
        {
          praiseIds: [praise._id, praise2._id],
          score: 144,
        },
      );

      expect(response.status).toBe(201);
    });
  });
});
