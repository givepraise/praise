import { AuthModule } from '../auth/auth.module';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserAccountsModule } from '../useraccounts/useraccounts.module';
import { UsersModule } from '../users/users.module';
import { EventLogModule } from '../event-log/event-log.module';
import { SettingsModule } from '../settings/settings.module';
import { PeriodSettingsModule } from '../periodsettings/periodsettings.module';
import { PraiseModule } from '../praise/praise.module';
import { QuantificationsModule } from '../quantifications/quantifications.module';
import { RequestContextModule } from 'nestjs-request-context';
import { PeriodsModule } from '../periods/periods.module';
import { ApiKeyModule } from '../api-key/api-key.module';
import { ActivateModule } from '../activate/activate.module';
import { CommunityModule } from '../community/community.module';
import { PRAISE_DB_NAME } from '@/constants/constants.provider';

@Module({
  imports: [
    MongooseModule.forRoot(
      `mongodb://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${PRAISE_DB_NAME}?authSource=admin&appname=Migrations`,
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
})
export class AppMigrationsModule {}
