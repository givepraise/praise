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
import { JwtService } from '@nestjs/jwt';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EventLog.name, schema: EventLogSchema },
      { name: EventLogType.name, schema: EventLogTypeSchema },
    ]),
  ],
  controllers: [EventLogController],
  providers: [EventLogService, ConstantsProvider, JwtService],
  exports: [EventLogService],
})
export class EventLogModule {}
