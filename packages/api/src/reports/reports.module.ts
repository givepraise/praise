import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { ConstantsProvider } from '../constants/constants.provider';
import { MongooseModule } from '@nestjs/mongoose';
import { Praise, PraiseSchema } from '../praise/schemas/praise.schema';
import {
  UserAccount,
  UserAccountSchema,
} from '../useraccounts/schemas/useraccounts.schema';
import { User, UserSchema } from '../users/schemas/users.schema';
import { KeyvCacheService } from '../database/services/keyv-cache.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Praise.name, schema: PraiseSchema },
      { name: UserAccount.name, schema: UserAccountSchema },
    ]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService, ConstantsProvider, KeyvCacheService],
})
export class ReportsModule {}
