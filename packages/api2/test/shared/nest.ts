import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ServiceExceptionFilter } from '@/shared/filters/service-exception.filter';
import { UsersService } from '@/users/users.service';
import { UsersModule } from '@/users/users.module';
import { UsersSeeder } from '@/database/seeder/users.seeder';
import { EventLogSeeder } from '@/database/seeder/event-log.seeder';
import { EventLogModule } from '@/event-log/event-log.module';
import { EventLogService } from '@/event-log/event-log.service';
import { runDbMigrations } from '@/database/migrations';
import { MongoServerErrorFilter } from '@/shared/filters/mongo-server-error.filter';
import { MongoValidationErrorFilter } from '@/shared/filters/mongo-validation-error.filter';
import { ActivateModule } from '@/activate/activate.module';
import { ApiKeyModule } from '@/api-key/api-key.module';
import { AuthModule } from '@/auth/auth.module';
import { PeriodsModule } from '@/periods/periods.module';
import { PeriodSettingsModule } from '@/periodsettings/periodsettings.module';
import { PraiseModule } from '@/praise/praise.module';
import { QuantificationsModule } from '@/quantifications/quantifications.module';
import { SettingsModule } from '@/settings/settings.module';
import { UserAccountsModule } from '@/useraccounts/useraccounts.module';
import { MongooseModule } from '@nestjs/mongoose';
import { RequestContextModule } from 'nestjs-request-context';
import { CommunityModule } from '@/community/community.module';
import { Server } from 'http';
import { ActivateService } from '@/activate/activate.service';
import { UserAccountsService } from '@/useraccounts/useraccounts.service';
import { UserAccountsSeeder } from '@/database/seeder/useraccounts.seeder';
import { ApiKeyService } from '@/api-key/api-key.service';

export let module: TestingModule;
export let app: INestApplication;
export let server: Server;
export let activateService: ActivateService;
export let usersSeeder: UsersSeeder;
export let usersService: UsersService;
export let userAccountsSeeder: UserAccountsSeeder;
export let userAccountsService: UserAccountsService;
export let eventLogSeeder: EventLogSeeder;
export let eventLogService: EventLogService;
export let apiKeyService: ApiKeyService;

async function startNest(): Promise<void> {
  module = await Test.createTestingModule({
    imports: [
      MongooseModule.forRoot(
        `mongodb://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/test-community?authSource=admin&appname=PraiseApi`,
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
    providers: [UsersSeeder, EventLogSeeder, UserAccountsSeeder],
  }).compile();

  app = module.createNestApplication();
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalFilters(new MongoServerErrorFilter());
  app.useGlobalFilters(new MongoValidationErrorFilter());
  app.useGlobalFilters(new ServiceExceptionFilter());
  server = app.getHttpServer();
  await app.init();

  // Run DB migrations
  await runDbMigrations(app);

  // Get and return services for convenience
  usersSeeder = module.get<UsersSeeder>(UsersSeeder);
  usersService = module.get<UsersService>(UsersService);
  eventLogSeeder = module.get<EventLogSeeder>(EventLogSeeder);
  eventLogService = module.get<EventLogService>(EventLogService);
  activateService = module.get<ActivateService>(ActivateService);
  userAccountsService = module.get<UserAccountsService>(UserAccountsService);
  apiKeyService = module.get<ApiKeyService>(ApiKeyService);
  userAccountsSeeder = module.get<UserAccountsSeeder>(UserAccountsSeeder);
}

beforeAll(async () => {
  await startNest();
});
