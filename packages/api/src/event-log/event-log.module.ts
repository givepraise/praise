import { Module } from '@nestjs/common';
import { EventLogController } from './event-log.controller';
import { EventLog, EventLogSchema } from './schemas/event-log.schema';
import { MongooseModule } from '@nestjs/mongoose';
import {
  EventLogType,
  EventLogTypeSchema,
} from './schemas/event-log-type.schema';
import { EventLogService } from './event-log.service';
import { ConstantsProvider } from '../constants/constants.provider';
import {
  UserAccount,
  UserAccountSchema,
} from '../useraccounts/schemas/useraccounts.schema';
import { User, UserSchema } from '../users/schemas/users.schema';
import { DbService } from '../database/services/db.service';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EventLog.name, schema: EventLogSchema },
      { name: EventLogType.name, schema: EventLogTypeSchema },
      { name: UserAccount.name, schema: UserAccountSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [EventLogController],
  providers: [EventLogService, ConstantsProvider, DbService],
  exports: [EventLogService],
})
export class EventLogModule {}
