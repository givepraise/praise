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
import { authorizedGetRequest, loginUser } from './test.common';
import { User } from '@/users/schemas/users.schema';
import { runDbMigrations } from '@/database/migrations';
import { AuthRole } from '@/auth/enums/auth-role.enum';
import { UserAccountsSeeder } from '@/database/seeder/useraccounts.seeder';
import { UserAccountsService } from '@/useraccounts/useraccounts.service';
import { UserAccountsModule } from '@/useraccounts/useraccounts.module';
import mongoose from 'mongoose';
import { QuantificationsSeeder } from '@/database/seeder/quantifications.seeder';
import { QuantificationsService } from '@/quantifications/services/quantifications.service';
import { PeriodsService } from '@/periods/services/periods.service';
import { PeriodsSeeder } from '@/database/seeder/periods.seeder';
import { PraiseSeeder } from '@/database/seeder/praise.seeder';
import { PraiseService } from '@/praise/services/praise.service';
import { PraiseModule } from '@/praise/praise.module';
import { PeriodsModule } from '@/periods/periods.module';
import { QuantificationsModule } from '@/quantifications/quantifications.module';
import { Praise } from '@/praise/schemas/praise.schema';
import { faker } from '@faker-js/faker';
import { Quantification } from '@/quantifications/schemas/quantifications.schema';
import { PeriodStatusType } from '@/periods/enums/status-type.enum';
import { Period } from '@/periods/schemas/periods.schema';

describe('UserAccountsController (E2E)', () => {
  let app: INestApplication;
  let server: Server;
  let module: TestingModule;
  let usersSeeder: UsersSeeder;
  let usersService: UsersService;
  let userAccountsService: UserAccountsService;
  let quantificationsSeeder: QuantificationsSeeder;
  let quantificationsService: QuantificationsService;
  let periodsService: PeriodsService;
  let periodsSeeder: PeriodsSeeder;
  let praiseSeeder: PraiseSeeder;
  let praiseService: PraiseService;
  let adminUser: User;
  let adminUserAccessToken: string;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        AppModule,
        UsersModule,
        PraiseModule,
        QuantificationsModule,
        UserAccountsModule,
        PeriodsModule,
      ],
      providers: [
        UsersSeeder,
        PraiseSeeder,
        QuantificationsSeeder,
        UserAccountsSeeder,
        PeriodsSeeder,
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
    userAccountsService = module.get<UserAccountsService>(UserAccountsService);
    praiseSeeder = module.get<PraiseSeeder>(PraiseSeeder);
    praiseService = module.get<PraiseService>(PraiseService);
    periodsSeeder = module.get<PeriodsSeeder>(PeriodsSeeder);
    periodsService = module.get<PeriodsService>(PeriodsService);
    quantificationsSeeder = module.get<QuantificationsSeeder>(
      QuantificationsSeeder,
    );
    quantificationsService = module.get<QuantificationsService>(
      QuantificationsService,
    );

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
    const response = await loginUser(app, module, wallet);
    adminUserAccessToken = response.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/quantifications/export', () => {
    let praise: Praise;
    const praises: Praise[] = [];
    let startDate: Date;
    let endDate: Date;
    let dateBetween: Date;
    const quantifications: Quantification[] = [];
    let period: Period;

    beforeAll((done) => {
      done();
    });

    afterAll((done) => {
      // Closing the DB connection allows Jest to exit successfully.
      mongoose.connection.close();
      done();
    });

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
      expect(response.body.message).toBe(
        'Invalid date filtering option. When periodId is set, startDate and endDate should not be set.',
      );
    });

    test('returns quantification filtered by latest periodId', async () => {
      const response = await authorizedGetRequest(
        `/quantifications/export?format=json&periodId=${period._id}`,
        app,
        adminUserAccessToken,
      ).expect(200);
      expect(response.body.length).toBe(1);
      expect(
        String(quantifications[2]._id) === response.body[0]._id,
      ).toBeTrue();
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
