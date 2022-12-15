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
import { PraiseModule } from '@/praise/praise.module';
import { PraiseSeeder } from '@/database/seeder/praise.seeder';
import { PraiseService } from '@/praise/praise.service';
import { UserRole } from '@/users/interfaces/user-role.interface';
import { QuantificationsSeeder } from '@/database/seeder/quantifications.seeder';
import { QuantificationsService } from '@/quantifications/quantifications.service';
import { UserAccountsSeeder } from '@/database/seeder/useraccounts.seeder';
import { UserAccountsService } from '../src/useraccounts/useraccounts.service';
import { Praise } from '@/praise/schemas/praise.schema';
import { QuantificationsModule } from '@/quantifications/quantifications.module';
import { UserAccountsModule } from '@/useraccounts/useraccounts.module';

jest.useFakeTimers();

describe('Praise (E2E)', () => {
  let app: INestApplication;
  let server: Server;
  let module: TestingModule;
  let usersSeeder: UsersSeeder;
  let usersService: UsersService;
  let praiseSeeder: PraiseSeeder;
  let praiseService: PraiseService;
  let quantificationsSeeder: QuantificationsSeeder;
  let quantificationsService: QuantificationsService;
  let userAccountsSeeder: UserAccountsSeeder;
  let userAccountsService: UserAccountsService;
  let wallet;
  let accessToken: string;
  let praise: Praise;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        AppModule,
        PraiseModule,
        UsersModule,
        QuantificationsModule,
        UserAccountsModule,
      ],
      providers: [
        UsersSeeder,
        PraiseSeeder,
        QuantificationsSeeder,
        UserAccountsSeeder,
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

    // Clear the database
    await usersService.getModel().deleteMany({});
    await praiseService.getModel().deleteMany({});
    await quantificationsService.getModel().deleteMany({});
    await userAccountsService.getModel().deleteMany({});

    // Seed the database
    wallet = Wallet.createRandom();
    const user = await usersSeeder.seedUser({
      identityEthAddress: wallet.address,
      rewardsAddress: wallet.address,
      roles: [UserRole.USER, UserRole.QUANTIFIER],
    });

    const quantifier = await userAccountsSeeder.seedUserAccount({
      user: user,
      ethAddress: wallet.address,
    });

    const quantification = await quantificationsSeeder.seedQuantification({
      quantifier: quantifier,
      score: 0,
      scoreRealized: 0,
      dismissed: false,
    });

    praise = await praiseSeeder.seedPraise({
      quantifications: [quantification],
    });

    // Login and get access token
    const response = await loginUser(app, module, wallet);
    accessToken = response.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/praise/:id/quantify', () => {
    test('401 when not authenticated', async () => {
      return request(server).get('/praise').send().expect(401);
    });

    it('should return 200', async () => {
      const response = await authorizedGetRequest(
        `/api/praise/${praise._id}/quantify`,
        app,
        accessToken,
      ).expect(200);

      expect(response.status).toBe(200);
    });
  });
});
