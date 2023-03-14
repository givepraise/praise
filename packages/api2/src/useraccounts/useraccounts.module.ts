import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserAccount, UserAccountSchema } from './schemas/useraccounts.schema';
import { UserAccountsService } from './useraccounts.service';
import { UserAccountsController } from './useraccounts.controller';
import { EventLogModule } from '@/event-log/event-log.module';
import { UsersModule } from '@/users/users.module';
import { AuthModule } from '@/auth/auth.module';
import { ApiKeyModule } from '@/api-key/api-key.module';
import { ConstantsProvider } from '@/constants/constants.provider';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserAccount.name, schema: UserAccountSchema },
    ]),
    EventLogModule,
    forwardRef(() => UsersModule),
    forwardRef(() => AuthModule),
    ApiKeyModule,
  ],
  controllers: [UserAccountsController],
  providers: [UserAccountsService, ConstantsProvider],
  exports: [
    MongooseModule.forFeature([
      { name: UserAccount.name, schema: UserAccountSchema },
    ]),
    UserAccountsService,
  ],
})
export class UserAccountsModule {}
