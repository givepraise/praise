import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserAccount, UserAccountSchema } from './schemas/useraccounts.schema';
import { UserAccountsService } from './useraccounts.service';
import { UserAccountsController } from './useraccounts.controller';
import { EventLogModule } from '@/event-log/event-log.module';
import { UsersModule } from '@/users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserAccount.name, schema: UserAccountSchema },
    ]),
    EventLogModule,
    UsersModule,
  ],
  controllers: [UserAccountsController],
  providers: [UserAccountsService],
  exports: [
    MongooseModule.forFeature([
      { name: UserAccount.name, schema: UserAccountSchema },
    ]),
    UserAccountsService,
  ],
})
export class UserAccountsModule {}
