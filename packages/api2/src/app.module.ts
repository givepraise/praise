import { AuthModule } from './auth/auth.module';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserAccountsModule } from './useraccounts/useraccounts.module';
import { UsersModule } from './users/users.module';
import { EventLogModule } from './event-log/event-log.module';
import { praiseDatabaseUri } from './shared/database.shared';
import { SettingsModule } from './settings/settings.module';
import { PeriodSettingsModule } from './periodsettings/periodsettings.module';
import { PraiseModule } from './praise/praise.module';
import { QuantificationsModule } from './quantifications/quantifications.module';
import { RequestContextModule } from 'nestjs-request-context';
import { PeriodsModule } from './periods/periods.module';
import { ApiKeyModule } from './api-key/api-key.module';
import { ActivateModule } from './activate/activate.module';

@Module({
  imports: [
    MongooseModule.forRoot(praiseDatabaseUri),
    ActivateModule,
    ApiKeyModule,
    AuthModule,
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
})
export class AppModule {}
