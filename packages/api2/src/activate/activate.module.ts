import { Module } from '@nestjs/common';
import { ActivateService } from './activate.service';
import { ActivateController } from './activate.controller';
import { UsersModule } from '@/users/users.module';
import { UserAccountsModule } from '@/useraccounts/useraccounts.module';
import { EventLogModule } from '@/event-log/event-log.module';

@Module({
  imports: [UsersModule, UserAccountsModule, EventLogModule],
  providers: [ActivateService],
  controllers: [ActivateController],
})
export class ActivateModule {}
