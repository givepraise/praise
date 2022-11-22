import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthModule } from './auth/auth.module';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserAccountsModule } from './useraccounts/useraccounts.module';
import { UsersModule } from './users/users.module';
import { praiseDatabaseUri } from './shared/database.shared';
import { SettingsModule } from './settings/settings.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: praiseDatabaseUri,
      inject: [ConfigService],
    }),

    UsersModule,
    UserAccountsModule,
    AuthModule,
    SettingsModule,
  ],
})
export class AppModule {}
