import {
  Controller,
  Get,
  Query,
  SerializeOptions,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { PermissionsGuard } from '@/auth/guards/permissions.guard';
import { Permission } from '@/auth/enums/permission.enum';
import { Permissions } from '@/auth/decorators/permissions.decorator';
import { EventLogFindPaginatedQueryDto } from './dto/event-log-find-paginated-query.dto';
import { EventLogService } from './event-log.service';
import { EventLog } from './schemas/event-log.schema';
import { EventLogType } from './schemas/event-log-type.schema';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { EventLogPaginatedResponseDto } from './dto/event-log-pagination-model.dto';
import { MongooseClassSerializerInterceptor } from '@/shared/mongoose-class-serializer.interceptor';

@Controller('event-log')
@ApiTags('Event Log')
// @UseGuards(PermissionsGuard)
// @UseGuards(AuthGuard(['jwt', 'api-key']))
@SerializeOptions({
  excludePrefixes: ['__'],
})
export class EventLogController {
  constructor(private eventLogService: EventLogService) {}

  @Get()
  @ApiOperation({ summary: 'List event logs, paginated results' })
  @ApiResponse({
    status: 200,
    description: 'Paginated event logs',
    type: EventLogPaginatedResponseDto,
  })
  @Permissions(Permission.EventLogView)
  @UseInterceptors(MongooseClassSerializerInterceptor(EventLog))
  findAllPaginated(
    @Query() options: EventLogFindPaginatedQueryDto,
  ): Promise<EventLogPaginatedResponseDto> {
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
  @UseInterceptors(MongooseClassSerializerInterceptor(EventLogType))
  types(): Promise<EventLogType[]> {
    return this.eventLogService.findTypes();
  }
}
