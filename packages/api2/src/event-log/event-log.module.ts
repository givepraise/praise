import { Module } from '@nestjs/common';
import { EventLogService } from './event-log.service';
import { EventLogController } from './event-log.controller';
import { EventLog, EventLogSchema } from './entities/event-log.entity';
import { MongooseModule } from '@nestjs/mongoose';
import {
  EventLogType,
  EventLogTypeSchema,
} from './entities/event-log-type.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EventLog.name, schema: EventLogSchema },
      { name: EventLogType.name, schema: EventLogTypeSchema },
    ]),
  ],
  controllers: [EventLogController],
  providers: [EventLogService],
})
export class EventLogModule {}
