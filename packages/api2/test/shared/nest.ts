import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Server } from 'http';
import { MongooseModule } from '@nestjs/mongoose';
import { RequestContextModule } from 'nestjs-request-context';

// Import modules and services
import { ActivateModule } from '@/activate/activate.module';
import { ActivateService } from '@/activate/activate.service';
import { ApiKeyModule } from '@/api-key/api-key.module';
import { ApiKeyService } from '@/api-key/api-key.service';
import { AuthModule } from '@/auth/auth.module';
import { EthSignatureService } from '@/auth/eth-signature.service';
import { CommunityModule } from '@/community/community.module';
import { CommunityService } from '@/community/community.service';
import { EventLogModule } from '@/event-log/event-log.module';
import { EventLogService } from '@/event-log/event-log.service';
import { PeriodsModule } from '@/periods/periods.module';
import { PeriodsService } from '@/periods/services/periods.service';
import { PeriodAssignmentsService } from '@/periods/services/period-assignments.service';
import { PeriodSettingsModule } from '@/periodsettings/periodsettings.module';
import { PeriodSettingsService } from '@/periodsettings/periodsettings.service';
import { PraiseModule } from '@/praise/praise.module';
import { PraiseService } from '@/praise/services/praise.service';
import { QuantificationsModule } from '@/quantifications/quantifications.module';
import { QuantificationsService } from '@/quantifications/services/quantifications.service';
import { SettingsModule } from '@/settings/settings.module';
import { SettingsService } from '@/settings/settings.service';
import { UserAccountsModule } from '@/useraccounts/useraccounts.module';
import { UserAccountsService } from '@/useraccounts/useraccounts.service';
import { UsersModule } from '@/users/users.module';
import { UsersService } from '@/users/users.service';

// Import filters
import { ServiceExceptionFilter } from '@/shared/filters/service-exception.filter';
import { MongoServerErrorFilter } from '@/shared/filters/mongo-server-error.filter';
import { MongoValidationErrorFilter } from '@/shared/filters/mongo-validation-error.filter';

// Import seeders
import { ApiKeySeeder } from '@/database/seeder/api-key.seeder';
import { CommunitiesSeeder } from '@/database/seeder/communities.seeder';
import { EventLogSeeder } from '@/database/seeder/event-log.seeder';
import { PeriodsSeeder } from '@/database/seeder/periods.seeder';
import { PeriodSettingsSeeder } from '@/database/seeder/periodsettings.seeder';
import { PraiseSeeder } from '@/database/seeder/praise.seeder';
import { QuantificationsSeeder } from '@/database/seeder/quantifications.seeder';
import { SettingsSeeder } from '@/database/seeder/settings.seeder';
import { UsersSeeder } from '@/database/seeder/users.seeder';
import { UserAccountsSeeder } from '@/database/seeder/useraccounts.seeder';

// Import migrations
import { runDbMigrations } from '@/database/migrations';
import { TEST_COMMUNITY_DB_NAME } from '@/constants/constants.provider';

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
export let periodSettingsService: PeriodSettingsService;
export let praiseService: PraiseService;
export let quantificationsService: QuantificationsService;
export let settingsService: SettingsService;
export let userAccountsService: UserAccountsService;
export let usersService: UsersService;

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

async function startNest(): Promise<void> {
  testingModule = await Test.createTestingModule({
    imports: [
      MongooseModule.forRoot(
        `mongodb://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${TEST_COMMUNITY_DB_NAME}?authSource=admin&appname=PraiseApi`,
      ),
      ActivateModule,
      ApiKeyModule,
      AuthModule,
      CommunityModule,
      EventLogModule,
      PeriodsModule,
      PeriodSettingsModule,
      PraiseModule,
      QuantificationsModule,
      RequestContextModule,
      SettingsModule,
      UserAccountsModule,
      UsersModule,
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

  // Run DB migrations
  await runDbMigrations(app);

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
  periodSettingsService = testingModule.get<PeriodSettingsService>(
    PeriodSettingsService,
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
});

afterAll(() => {
  app.close();
});
