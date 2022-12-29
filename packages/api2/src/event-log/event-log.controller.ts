import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { PermissionsGuard } from '@/auth/guards/permissions.guard';
import { Permission } from '@/auth/enums/permission.enum';
import { Permissions } from '@/auth/decorators/permissions.decorator';
import { FindAllPaginatedQuery } from './dto/find-all-paginated-query.dto';
import { EventLogService } from './event-log.service';
import { EventLog } from './schemas/event-log.schema';
import { EventLogType } from './schemas/event-log-type.schema';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PaginationModel } from '@/shared/dto/pagination-model.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('event-log')
@UseGuards(PermissionsGuard)
@UseGuards(AuthGuard(['jwt', 'api-key']))
export class EventLogController {
  constructor(private eventLogService: EventLogService) {}

  @Get()
  @ApiOperation({ summary: 'List event logs, paginated results' })
  @ApiResponse({
    status: 200,
    description: 'Paginated event logs',
    type: PaginationModel<EventLog>,
  })
  @Permissions(Permission.EventLogView)
  findAllPaginated(
    @Query() options: FindAllPaginatedQuery,
  ): Promise<PaginationModel<EventLog>> {
    return this.eventLogService.findAllPaginated(options);
  }

  @Get('types')
  @ApiOperation({ summary: 'List event log types' })
  @ApiResponse({
    status: 200,
    description: 'Event log types',
    type: [EventLogType],
  })
  @Permissions(Permission.EventLogView)
  types(): Promise<EventLogType[]> {
    return this.eventLogService.findTypes();
  }
}
