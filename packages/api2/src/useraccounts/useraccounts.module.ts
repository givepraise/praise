import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserAccount, UserAccountSchema } from './schemas/useraccounts.schema';
import { UserAccountsService } from './useraccounts.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserAccount.name, schema: UserAccountSchema },
    ]),
  ],
  providers: [UserAccountsService],
  exports: [
    MongooseModule.forFeature([
      { name: UserAccount.name, schema: UserAccountSchema },
    ]),
    UserAccountsService,
  ],
})
export class UserAccountsModule {}
