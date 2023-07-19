import { EthSignatureModule } from './auth/eth-signature.module';
import { MiddlewareConsumer, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserAccountsModule } from './useraccounts/useraccounts.module';
import { UsersModule } from './users/users.module';
import { EventLogModule } from './event-log/event-log.module';
import { SettingsModule } from './settings/settings.module';
import { PraiseModule } from './praise/praise.module';
import { QuantificationsModule } from './quantifications/quantifications.module';
import { RequestContextModule } from 'nestjs-request-context';
import { PeriodsModule } from './periods/periods.module';
import { ApiKeyModule } from './api-key/api-key.module';
import { ActivateModule } from './activate/activate.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { CommunityModule } from './community/community.module';
import { RequestLoggerMiddleware } from './shared/middlewares/request-logger.middleware';
import { AuthGuardModule } from './auth/auth-guard.module';
import { PingMiddleware } from './shared/middlewares/ping.middleware';
import { DomainCheckMiddleware } from './shared/middlewares/domainCheck.middleware';
import { ReportsModule } from './reports/reports.module';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_ADMIN_URI || '', {
      maxPoolSize: 100,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      bufferCommands: false,
    }),
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: process.env.NODE_ENV === 'testing' ? 1000 : 100, // 10 requests per minute, except in development
    }),
    CacheModule.register({
      isGlobal: true,
    }),
    ActivateModule,
    ApiKeyModule,
    AuthGuardModule,
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
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {
  // Add a middleware on all routes
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(DomainCheckMiddleware).forRoutes('domain-check');
    consumer.apply(PingMiddleware).forRoutes('ping');
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}
