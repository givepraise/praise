import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { PermissionsGuard } from '@/auth/guards/permissions.guard';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { Permission } from '@/auth/enums/permission.enum';
import { Permissions } from '@/auth/decorators/permissions.decorator';
import { FindAllPaginatedQuery } from './dto/find-all-paginated-query.dto';
import { EventLogService } from './event-log.service';
import { PaginationModel } from 'mongoose-paginate-ts';
import { EventLog } from './entities/event-log.entity';
import { EventLogType } from './entities/event-log-type.entity';

@Controller('event-log')
@UseGuards(PermissionsGuard)
@UseGuards(JwtAuthGuard)
export class EventLogController {
  constructor(private eventLogService: EventLogService) {}

  @Get()
  @Permissions(Permission.EventLogView)
  findAllPaginated(
    @Query() options: FindAllPaginatedQuery,
  ): Promise<PaginationModel<EventLog>> {
    return this.eventLogService.findAllPaginated(options);
  }

  @Get('types')
  @Permissions(Permission.EventLogView)
  types(): Promise<EventLogType[]> {
    return this.eventLogService.findTypes();
  }
}
