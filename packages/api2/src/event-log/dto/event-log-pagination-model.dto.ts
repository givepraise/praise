import { ApiResponseProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PaginationModel } from '@/shared/dto/pagination-model.dto';
import { EventLog } from '../schemas/event-log.schema';

export class EventLogPaginationModelDto extends PaginationModel {
  @ApiResponseProperty({
    type: [EventLog],
  })
  @Type(() => EventLog)
  docs: EventLog[];
}
