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
import { UsersSeeder } from '@/database/seeder/users.seeder';
import { runDbMigrations } from '@/database/migrations';
import { UsersModule } from '@/users/users.module';
import { UserAccountsSeeder } from '@/database/seeder/useraccounts.seeder';
import { UserAccountsService } from '@/useraccounts/useraccounts.service';
import { UserAccount } from '@/useraccounts/schemas/useraccounts.schema';
import { ActivateService } from '@/activate/activate.service';
import { UserAccountsModule } from '@/useraccounts/useraccounts.module';
import { ActivateModule } from '@/activate/activate.module';
import { EventLogModule } from '@/event-log/event-log.module';
import { EventLogService } from '@/event-log/__mocks__/event-log.service';
import { UsersService } from '@/users/users.service';
import { User } from '@/users/schemas/users.schema';
import { PeriodsModule } from '@/periods/periods.module';
import { PraiseModule } from '@/praise/praise.module';

describe('EventLog (E2E)', () => {
  let app: INestApplication;
  let server: Server;
  let module: TestingModule;
  let usersService: UsersService;
  let userAccountsService: UserAccountsService;
  let userAccountsSeeder: UserAccountsSeeder;
  let activateService: ActivateService;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        AppModule,
        UsersModule,
        UserAccountsModule,
        ActivateModule,
        EventLogModule,
        PeriodsModule,
        PraiseModule,
      ],
      providers: [
        UsersSeeder,
        UsersService,
        UserAccountsSeeder,
        UserAccountsService,
        ActivateService,
        EventLogService,
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
    usersService = module.get<UsersService>(UsersService);
    userAccountsSeeder = module.get<UserAccountsSeeder>(UserAccountsSeeder);
    userAccountsService = module.get<UserAccountsService>(UserAccountsService);
    activateService = module.get<ActivateService>(ActivateService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/activate - Activate user account', () => {
    test('400 when no accountId', async () => {
      await request(server)
        .post('/activate')
        .send({
          identityEthAddress: '0x123',
          signature: '0x123',
        })
        .expect(400);
    });

    test('400 when no identityEthAddress', async () => {
      await request(server)
        .post('/activate')
        .send({
          accountId: '0x123',
          signature: '0x123',
        })
        .expect(400);
    });

    test('400 when no signature', async () => {
      await request(server)
        .post('/activate')
        .send({
          accountId: '0x123',
          identityEthAddress: '0x123',
        })
        .expect(400);
    });

    test('400 when invalid signature', async () => {
      await request(server)
        .post('/activate')
        .send({
          accountId: '0x123',
          identityEthAddress: '0x123',
          signature: '0x123',
        })
        .expect(400);
    });

    test('400 when account not found', async () => {
      const wallet = Wallet.createRandom();
      const signature = await wallet.signMessage(
        activateService.generateActivateMessage(
          wallet.address,
          wallet.address,
          '0x123',
        ),
      );

      await request(server)
        .post('/activate')
        .send({
          accountId: wallet.address,
          identityEthAddress: wallet.address,
          signature,
        })
        .expect(400);
    });

    test('400 when user account not found', async () => {
      //Clear the database
      await userAccountsService.getModel().deleteMany({});
      await usersService.getModel().deleteMany({});

      const wallet = Wallet.createRandom();
      const signature = await wallet.signMessage(
        activateService.generateActivateMessage(
          wallet.address,
          wallet.address,
          '0x123',
        ),
      );

      await request(server)
        .post('/activate')
        .send({
          accountId: wallet.address,
          identityEthAddress: wallet.address,
          signature,
        })
        .expect(400);
    });

    test('400 activation token not found', async () => {
      // Seed the database
      const wallet = Wallet.createRandom();
      const ua: UserAccount = await userAccountsSeeder.seedUserAccount({
        user: undefined,
        identityEthAddress: wallet.address,
        activationToken: undefined,
      });

      const signature = await wallet.signMessage(
        activateService.generateActivateMessage(
          ua.accountId,
          wallet.address,
          'token not found',
        ),
      );

      await request(server)
        .post('/activate')
        .send({
          accountId: ua.accountId,
          identityEthAddress: wallet.address,
          signature,
        })
        .expect(400);
    });

    test('400 when account already activated', async () => {
      //Clear the database
      await userAccountsService.getModel().deleteMany({});
      await usersService.getModel().deleteMany({});

      // Seed the database
      const wallet = Wallet.createRandom();
      const ua: UserAccount = await userAccountsSeeder.seedUserAccount({
        user: undefined,
        identityEthAddress: wallet.address,
      });

      const signature = await wallet.signMessage(
        activateService.generateActivateMessage(
          ua.accountId,
          wallet.address,
          ua.activateToken,
        ),
      );

      await request(server)
        .post('/activate')
        .send({
          accountId: ua.accountId,
          identityEthAddress: wallet.address,
          signature,
        })
        .expect(201);

      await request(server)
        .post('/activate')
        .send({
          accountId: ua.accountId,
          identityEthAddress: wallet.address,
          signature,
        })
        .expect(400);
    });

    test('400 when signing using wrong wallet', async () => {
      //Clear the database
      await userAccountsService.getModel().deleteMany({});
      await usersService.getModel().deleteMany({});

      // Seed the database
      const wallet = Wallet.createRandom();
      const ua: UserAccount = await userAccountsSeeder.seedUserAccount({
        user: undefined,
        identityEthAddress: wallet.address,
      });

      const wallet2 = Wallet.createRandom();
      const signature = await wallet2.signMessage(
        activateService.generateActivateMessage(
          ua.accountId,
          wallet.address,
          ua.activateToken,
        ),
      );

      await request(server)
        .post('/activate')
        .send({
          accountId: ua.accountId,
          identityEthAddress: wallet.address,
          signature,
        })
        .expect(400);
    });

    test('201 and correct body when activating', async () => {
      //Clear the database
      await userAccountsService.getModel().deleteMany({});
      await usersService.getModel().deleteMany({});

      // Seed the database
      const wallet = Wallet.createRandom();
      const ua: UserAccount = await userAccountsSeeder.seedUserAccount({
        user: undefined,
        identityEthAddress: wallet.address,
      });

      const signature = await wallet.signMessage(
        activateService.generateActivateMessage(
          ua.accountId,
          wallet.address,
          ua.activateToken,
        ),
      );

      const response = await request(server)
        .post('/activate')
        .send({
          accountId: ua.accountId,
          identityEthAddress: wallet.address,
          signature,
        })
        .expect(201);

      const user = response.body;

      expect(user.identityEthAddress).toBe(wallet.address);
      expect(user.rewardsEthAddress).toBe(wallet.address);
      expect(user.username).toBe(ua.name);
    });
  });
});
