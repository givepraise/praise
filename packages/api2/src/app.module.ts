import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthModule } from './auth/auth.module';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserAccountsModule } from './useraccounts/useraccounts.module';
import { UsersModule } from './users/users.module';
import { praiseDatabaseUri } from './shared/database.shared';

@Module({
  imports: [
    MongooseModule.forRoot(praiseDatabaseUri),
    UsersModule,
    UserAccountsModule,
    AuthModule,
  ],
})
export class AppModule {}
