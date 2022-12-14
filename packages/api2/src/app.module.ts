import { AuthModule } from './auth/auth.module';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserAccountsModule } from './useraccounts/useraccounts.module';
import { UsersModule } from './users/users.module';
import { EventLogModule } from './event-log/event-log.module';
import { UtilsProvider } from './utils/utils.provider';
import { praiseDatabaseUri } from './shared/database.shared';
import { SettingsModule } from './settings/settings.module';
import { PeriodSettingsModule } from './periodsettings/periodsettings.module';
import { PraiseModule } from './praise/praise.module';
import { ConstantsProvider } from './constants/constants.provider';
import { QuantificationsModule } from './quantifications/quantifications.module';

@Module({
  imports: [
    MongooseModule.forRoot(praiseDatabaseUri),
    UsersModule,
    UserAccountsModule,
    AuthModule,
    EventLogModule,
    SettingsModule,
    PeriodSettingsModule,
    PraiseModule,
    QuantificationsModule,
  ],
  providers: [UtilsProvider, ConstantsProvider],
})
export class AppModule {}
