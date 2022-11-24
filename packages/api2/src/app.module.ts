import { AuthModule } from './auth/auth.module';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserAccountsModule } from './useraccounts/useraccounts.module';
import { UsersModule } from './users/users.module';
import { UtilsProvider } from './utils/utils.provider';
import { praiseDatabaseUri } from './shared/database.shared';
import { SettingsModule } from './settings/settings.module';
import { PeriodsettingsModule } from './periodsettings/periodsettings.module';

@Module({
  imports: [
    MongooseModule.forRoot(praiseDatabaseUri),
    UsersModule,
    UserAccountsModule,
    AuthModule,
    SettingsModule,
    PeriodsettingsModule,
  ],
  providers: [UtilsProvider],
})
export class AppModule {}
