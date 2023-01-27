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
import { authorizedGetRequest, loginUser } from './test.common';
import { runDbMigrations } from '@/database/migrations';
import { PraiseModule } from '@/praise/praise.module';
import { QuantificationsModule } from '@/quantifications/quantifications.module';
import { UserAccountsModule } from '@/useraccounts/useraccounts.module';
import { PeriodsService } from '../src/periods/services/periods.service';
import { PraiseSeeder } from '@/database/seeder/praise.seeder';
import { QuantificationsSeeder } from '@/database/seeder/quantifications.seeder';
import { UserAccountsSeeder } from '@/database/seeder/useraccounts.seeder';
import { PraiseService } from '@/praise/praise.service';
import { QuantificationsService } from '@/quantifications/quantifications.service';
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
import { AuthRole } from '@/auth/enums/auth-role.enum';
import { User } from '@/users/schemas/users.schema';
import { PaginatedQueryDto } from '@/shared/dto/pagination-query.dto';

class LoggedInUser {
  accessToken: string;
  user: User;
  wallet: Wallet;
}

describe('Period (E2E)', () => {
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
    periodsSeeder = module.get<PeriodsSeeder>(PeriodsSeeder);
    periodsService = module.get<PeriodsService>(PeriodsService);
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
      const response = await loginUser(app, module, wallet);
      users.push({
        accessToken: response.accessToken,
        user,
        wallet,
      });
    }
  });

  afterAll(async () => {
    await app.close();
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

      expect(response.body).toMatchObject({
        status: period.status,
        endDate: period.endDate.toISOString(),
        createdAt: period.createdAt.toISOString(),
        updatedAt: period.updatedAt.toISOString(),
      });

      expect(response.body.quantifiers).toHaveLength(1);
      expect(response.body.receivers).toHaveLength(6);
      expect(response.body.givers).toHaveLength(6);
    });

    test('should return 400 when the period does not exist', async () => {
      return request(server)
        .get(`/periods/5f5d5f5d5f5d5f5d5f5d5f5d`)
        .set('Authorization', `Bearer ${users[0].accessToken}`)
        .expect(400);
    });
  });

  describe('GET /periods/export', () => {
    let period: Period;
    let periods: Period[] = [];

    beforeAll(async () => {
      await periodsService.getModel().deleteMany({});

      period = await periodsSeeder.seedPeriod({
        status: PeriodStatusType.OPEN,
        endDate: new Date(),
      });

      periods.push(period);

      const previousPeriodEndDate = new Date(period.endDate.getTime());
      previousPeriodEndDate.setDate(period.endDate.getDate() - 30);

      periods.push(await periodsSeeder.seedPeriod({
        status: PeriodStatusType.OPEN,
        endDate: previousPeriodEndDate,
      }));
    });

    test('401 when not authenticated', async () => {
      await request(server).get(`/periods/export`).send().expect(401);
    });

    test('returns period list that matches seeded list in json format', async () => {
      const response = await authorizedGetRequest(
        '/periods/export?format=json',
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
        '/periods/export?format=csv',
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
      expect(period._id).toBe(period2!._id.toString());
      expect(period.status).toBe(period2!.status);
      expect(period.endDate).toBe(period2!.endDate.toISOString());
      expect(period.name).toBe(period2!.name);
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

      expect(response.body).toMatchObject({
        status: PeriodStatusType.OPEN,
        endDate: endDate.toISOString(),
      });

      expect(response.body.quantifiers).toBeDefined();
      expect(response.body.receivers).toBeDefined();
      expect(response.body.givers).toBeDefined();
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

    test('should return 400 when the period does not exist', async () => {
      return request(server)
        .patch(`/periods/5f5d5f5d5f5d5f5d5f5d5f5d`)
        .set('Authorization', `Bearer ${users[0].accessToken}`)
        .expect(400);
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

      expect(response.body).toMatchObject({
        status: PeriodStatusType.OPEN,
        endDate: endDate.toISOString(),
      });

      expect(response.body.quantifiers).toBeDefined();
      expect(response.body.receivers).toBeDefined();
      expect(response.body.givers).toBeDefined();
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
      return request(server)
        .patch(`/periods/${period._id}/close`)
        .set('Authorization', `Bearer ${users[1].accessToken}`)
        .send()
        .expect(403);
    });

    test('should return 400 when the period does not exist', async () => {
      return request(server)
        .patch(`/periods/5f5d5f5d5f5d5f5d5f5d5f5d/close`)
        .set('Authorization', `Bearer ${users[0].accessToken}`)
        .expect(400);
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

    test('should return 200 and period details when the request body is valid', async () => {
      const response = await request(server)
        .patch(`/periods/${period._id}/close`)
        .set('Authorization', `Bearer ${users[0].accessToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        status: PeriodStatusType.CLOSED,
      });

      expect(response.body.quantifiers).toBeDefined();
      expect(response.body.receivers).toBeDefined();
      expect(response.body.givers).toBeDefined();
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

    test('should return 400 when the period does not exist', async () => {
      await praiseService.getModel().deleteMany({});

      const response = await request(server)
        .get(`/periods/5f5d5f5d5f5d5f5d5f5d5f5d/praise`)
        .set('Authorization', `Bearer ${users[0].accessToken}`)
        .expect(400);

      expect(response.body.message).toBe('Period not found');
    });

    test('should return 200 and list of praise items', async () => {
      const response = await request(server)
        .get(`/periods/${period._id}/praise`)
        .set('Authorization', `Bearer ${users[0].accessToken}`)
        .expect(200);

      expect(response.body).toHaveLength(3);
      expect(response.body[0].quantifications).toHaveLength(1);
      expect(response.body[0].quantifications[0].quantifier).toBeDefined();
      expect(response.body[0].receiver).toBeDefined();
      expect(response.body[0].giver).toBeDefined();
    });
  });
});
