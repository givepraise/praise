import { ApiResponseProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PaginatedResponseDto } from '../../shared/dto/paginated-response.dto';
import { EventLog } from '../schemas/event-log.schema';

export class EventLogPaginatedResponseDto extends PaginatedResponseDto {
  @ApiResponseProperty({
    type: [EventLog],
  })
  @Type(() => EventLog)
  docs: EventLog[];
}
