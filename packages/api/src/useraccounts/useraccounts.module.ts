import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserAccount, UserAccountSchema } from './schemas/useraccounts.schema';
import { UserAccountsService } from './useraccounts.service';
import { UserAccountsController } from './useraccounts.controller';
import { EventLogModule } from '../event-log/event-log.module';
import { UsersModule } from '../users/users.module';
import { ConstantsProvider } from '../constants/constants.provider';
import { DbService } from '../database/services/db.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserAccount.name, schema: UserAccountSchema },
    ]),
    EventLogModule,
    UsersModule,
  ],
  controllers: [UserAccountsController],
  providers: [UserAccountsService, ConstantsProvider, DbService],
  exports: [UserAccountsService],
})
export class UserAccountsModule {}
