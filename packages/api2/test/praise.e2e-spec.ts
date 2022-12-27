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
import { authorizedPostRequest, loginUser } from './test.common';
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
import { UserRole } from '@/users/interfaces/user-role.interface';
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
  let praise: Praise;
  let period: Period;
  let quantifier: UserAccount;
  let periodSettingsAllowedValues: PeriodSetting;

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
      roles: [UserRole.USER, UserRole.QUANTIFIER],
    });

    quantifier = await userAccountsSeeder.seedUserAccount({
      user: user,
      ethAddress: wallet.address,
    });

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

    periodSettingsAllowedValues = await periodSettingsSeeder.seedPeriodSettings(
      {
        period: period,
        key: 'PRAISE_QUANTIFY_ALLOWED_VALUES',
        value: '0, 1, 3, 5, 8, 13, 21, 34, 55, 89, 144',
        type: 'StringList',
      },
    );

    // Login and get access token
    const response = await loginUser(app, module, wallet);
    accessToken = response.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/praise/{id}/quantify', () => {
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
  });

  describe('POST /api/praise/quantify', () => {
    test('401 when not authenticated', async () => {
      return request(server).post(`/praise/quantify`).send().expect(401);
    });

    test('201 when correct data is sent', async () => {
      const praise2 = await praiseSeeder.seedPraise();

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
