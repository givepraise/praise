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

export type StartNestReturn = {
  module: TestingModule;
  app: INestApplication;
  server: Server;
  usersSeeder: UsersSeeder;
  usersService: UsersService;
  eventLogSeeder: EventLogSeeder;
  eventLogService: EventLogService;
};

export async function startNest(): Promise<StartNestReturn> {
  const module = await Test.createTestingModule({
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
    providers: [UsersSeeder, EventLogSeeder],
  }).compile();

  const app = module.createNestApplication();
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
  const server = app.getHttpServer();
  await app.init();

  // Run DB migrations
  await runDbMigrations(app);

  // Get and return services for convenience
  const usersSeeder = module.get<UsersSeeder>(UsersSeeder);
  const usersService = module.get<UsersService>(UsersService);
  const eventLogSeeder = module.get<EventLogSeeder>(EventLogSeeder);
  const eventLogService = module.get<EventLogService>(EventLogService);

  return {
    module,
    app,
    server,
    usersSeeder,
    usersService,
    eventLogSeeder,
    eventLogService,
  };
}
