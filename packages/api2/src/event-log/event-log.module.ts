import { Module, forwardRef } from '@nestjs/common';
import { EventLogController } from './event-log.controller';
import { EventLog, EventLogSchema } from './schemas/event-log.schema';
import { MongooseModule } from '@nestjs/mongoose';
import {
  EventLogType,
  EventLogTypeSchema,
} from './schemas/event-log-type.schema';
import { EventLogService } from './event-log.service';
import { AuthModule } from '@/auth/auth.module';
import { ApiKeyModule } from '@/api-key/api-key.module';
import { ConstantsProvider } from '@/constants/constants.provider';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EventLog.name, schema: EventLogSchema },
      { name: EventLogType.name, schema: EventLogTypeSchema },
    ]),
    forwardRef(() => AuthModule),
    forwardRef(() => ApiKeyModule),
  ],
  controllers: [EventLogController],
  providers: [EventLogService, ConstantsProvider],
  exports: [
    EventLogService,
    MongooseModule.forFeature([
      { name: EventLog.name, schema: EventLogSchema },
      { name: EventLogType.name, schema: EventLogTypeSchema },
    ]),
  ],
})
export class EventLogModule {}
