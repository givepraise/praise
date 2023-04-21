import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Server } from 'http';
import { MongooseModule } from '@nestjs/mongoose';
import { RequestContextModule } from 'nestjs-request-context';

// Import modules and services
import { ActivateModule } from '../../src/activate/activate.module';
import { ActivateService } from '../../src/activate/activate.service';
import { ApiKeyModule } from '../../src/api-key/api-key.module';
import { ApiKeyService } from '../../src/api-key/api-key.service';
import { EthSignatureModule } from '../../src/auth/eth-signature.module';
import { EthSignatureService } from '../../src/auth/eth-signature.service';
import { CommunityModule } from '../../src/community/community.module';
import { CommunityService } from '../../src/community/community.service';
import { EventLogModule } from '../../src/event-log/event-log.module';
import { EventLogService } from '../../src/event-log/event-log.service';
import { PeriodsModule } from '../../src/periods/periods.module';
import { PeriodsService } from '../../src/periods/services/periods.service';
import { PeriodAssignmentsService } from '../../src/periods/services/period-assignments.service';
import { PraiseModule } from '../../src/praise/praise.module';
import { PraiseService } from '../../src/praise/services/praise.service';
import { QuantificationsModule } from '../../src/quantifications/quantifications.module';
import { QuantificationsService } from '../../src/quantifications/services/quantifications.service';
import { SettingsModule } from '../../src/settings/settings.module';
import { SettingsService } from '../../src/settings/settings.service';
import { UserAccountsModule } from '../../src/useraccounts/useraccounts.module';
import { UserAccountsService } from '../../src/useraccounts/useraccounts.service';
import { UsersModule } from '../../src/users/users.module';
import { UsersService } from '../../src/users/users.service';
import { ReportsModule } from '../../src/reports/reports.module';
import { ReportsService } from '../../src/reports/reports.service';

// Import filters
import { ServiceExceptionFilter } from '../../src/shared/filters/service-exception.filter';
import { MongoServerErrorFilter } from '../../src/shared/filters/mongo-server-error.filter';
import { MongoValidationErrorFilter } from '../../src/shared/filters/mongo-validation-error.filter';

// Import seeders
import { ApiKeySeeder } from '../../src/database/seeder/api-key.seeder';
import { CommunitiesSeeder } from '../../src/database/seeder/communities.seeder';
import { EventLogSeeder } from '../../src/database/seeder/event-log.seeder';
import { PeriodsSeeder } from '../../src/database/seeder/periods.seeder';
import { PeriodSettingsSeeder } from '../../src/database/seeder/periodsettings.seeder';
import { PraiseSeeder } from '../../src/database/seeder/praise.seeder';
import { QuantificationsSeeder } from '../../src/database/seeder/quantifications.seeder';
import { SettingsSeeder } from '../../src/database/seeder/settings.seeder';
import { UsersSeeder } from '../../src/database/seeder/users.seeder';
import { UserAccountsSeeder } from '../../src/database/seeder/useraccounts.seeder';

// Import migrations
import { HOSTNAME_TEST } from '../../src/constants/constants.provider';
import { MultiTenancyManager } from '../../src/database/multi-tenancy-manager';
import { MigrationsManager } from '../../src/database/migrations-manager';
import { CacheModule } from '@nestjs/cache-manager';

// Core Nest objects
export let testingModule: TestingModule;
export let app: INestApplication;
export let server: Server;

// Services
export let activateService: ActivateService;
export let apiKeyService: ApiKeyService;
export let communityService: CommunityService;
export let eventLogService: EventLogService;
export let ethSignatureService: EthSignatureService;
export let periodsService: PeriodsService;
export let periodsAssignmentService: PeriodAssignmentsService;
export let praiseService: PraiseService;
export let quantificationsService: QuantificationsService;
export let settingsService: SettingsService;
export let userAccountsService: UserAccountsService;
export let usersService: UsersService;
export let reportsService: ReportsService;

// Seeders
export let apiKeySeeder: ApiKeySeeder;
export let communitiesSeeder: CommunitiesSeeder;
export let eventLogSeeder: EventLogSeeder;
export let periodsSeeder: PeriodsSeeder;
export let periodSettingsSeeder: PeriodSettingsSeeder;
export let praiseSeeder: PraiseSeeder;
export let quantificationsSeeder: QuantificationsSeeder;
export let settingsSeeder: SettingsSeeder;
export let usersSeeder: UsersSeeder;
export let userAccountsSeeder: UserAccountsSeeder;

export async function startNest(): Promise<void> {
  // Make sure the database is setup for multi-tenancy
  const multiTenancyManager = new MultiTenancyManager();
  await multiTenancyManager.run();

  // Migrate the database to latest format
  const migrationsManager = new MigrationsManager();
  await migrationsManager.run();

  const testDbName = HOSTNAME_TEST.replace(/\./g, '-');

  testingModule = await Test.createTestingModule({
    imports: [
      MongooseModule.forRoot(
        `mongodb://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${testDbName}?authSource=admin&appname=PraiseApi`,
      ),
      CacheModule.register({
        isGlobal: true,
      }),
      ActivateModule,
      ApiKeyModule,
      EthSignatureModule,
      CommunityModule,
      EventLogModule,
      PeriodsModule,
      PraiseModule,
      QuantificationsModule,
      RequestContextModule,
      SettingsModule,
      UserAccountsModule,
      UsersModule,
      ReportsModule,
    ],
    providers: [
      ApiKeySeeder,
      CommunitiesSeeder,
      EventLogSeeder,
      PeriodsSeeder,
      PeriodSettingsSeeder,
      PraiseSeeder,
      QuantificationsSeeder,
      SettingsSeeder,
      UserAccountsSeeder,
      UsersSeeder,
    ],
  }).compile();

  app = testingModule.createNestApplication();
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      // TODO: Enabling these causes 400 error all over the place, investigate!
      // forbidUnknownValues: true,
      // skipMissingProperties: false,
    }),
  );
  app.useGlobalFilters(new MongoServerErrorFilter());
  app.useGlobalFilters(new MongoValidationErrorFilter());
  app.useGlobalFilters(new ServiceExceptionFilter());
  server = app.getHttpServer();
  await app.init();

  // Services
  activateService = testingModule.get<ActivateService>(ActivateService);
  apiKeyService = testingModule.get<ApiKeyService>(ApiKeyService);
  communityService = testingModule.get<CommunityService>(CommunityService);
  ethSignatureService =
    testingModule.get<EthSignatureService>(EthSignatureService);
  eventLogService = testingModule.get<EventLogService>(EventLogService);
  periodsService = testingModule.get<PeriodsService>(PeriodsService);
  periodsAssignmentService = testingModule.get<PeriodAssignmentsService>(
    PeriodAssignmentsService,
  );
  praiseService = testingModule.get<PraiseService>(PraiseService);
  quantificationsService = testingModule.get<QuantificationsService>(
    QuantificationsService,
  );
  settingsService = testingModule.get<SettingsService>(SettingsService);
  usersService = testingModule.get<UsersService>(UsersService);
  userAccountsService =
    testingModule.get<UserAccountsService>(UserAccountsService);

  //Seeders
  apiKeySeeder = testingModule.get<ApiKeySeeder>(ApiKeySeeder);
  communitiesSeeder = testingModule.get<CommunitiesSeeder>(CommunitiesSeeder);
  eventLogSeeder = testingModule.get<EventLogSeeder>(EventLogSeeder);
  periodsSeeder = testingModule.get<PeriodsSeeder>(PeriodsSeeder);
  periodSettingsSeeder =
    testingModule.get<PeriodSettingsSeeder>(PeriodSettingsSeeder);
  praiseSeeder = testingModule.get<PraiseSeeder>(PraiseSeeder);
  quantificationsSeeder = testingModule.get<QuantificationsSeeder>(
    QuantificationsSeeder,
  );
  settingsSeeder = testingModule.get<SettingsSeeder>(SettingsSeeder);
  userAccountsSeeder =
    testingModule.get<UserAccountsSeeder>(UserAccountsSeeder);
  usersSeeder = testingModule.get<UsersSeeder>(UsersSeeder);
}

beforeAll(async () => {
  await startNest();
  await new Promise((resolve) => setTimeout(resolve, 1000)); // await for 1 second for the server to start and connect to the database
});

afterAll(async () => {
  await app.close();
});
