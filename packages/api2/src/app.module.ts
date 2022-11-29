import { AuthModule } from './auth/auth.module';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserAccountsModule } from './useraccounts/useraccounts.module';
import { UsersModule } from './users/users.module';
import { UtilsProvider } from './utils/utils.provider';
import { praiseDatabaseUri } from './shared/database.shared';
import { SettingsModule } from './settings/settings.module';
import { PeriodSettingsModule } from './periodsettings/periodsettings.module';
import { PraiseModule } from './praise/praise.module';

@Module({
  imports: [
    MongooseModule.forRoot(praiseDatabaseUri),
    UsersModule,
    UserAccountsModule,
    AuthModule,
    SettingsModule,
    PeriodSettingsModule,
    PraiseModule,
  ],
  providers: [UtilsProvider],
})
export class AppModule {}
