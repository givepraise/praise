import { Controller, Get, Query, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { PaginationQuery } from '@/shared/dto/pagination-query.dto';
import { PermissionsGuard } from '@/auth/guards/permissions.guard';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { Permission } from '@/auth/enums/permission.enum';
import { Permissions } from '@/auth/decorators/permissions.decorator';
import { FindAllQuery } from './dto/find-all-query.dto';
import { EventLogService } from './event-log.service';

@Controller('event-log')
@UseGuards(PermissionsGuard)
@UseGuards(JwtAuthGuard)
export class EventLogController {
  constructor(private eventLogService: EventLogService) {}

  @Get()
  @Permissions(Permission.EventLogView)
  findAll(@Query() options: FindAllQuery) {
    console.log('options', options);
    return this.eventLogService.findAll(options);
  }

  @Get('types')
  @Permissions(Permission.EventLogView)
  types(@Req() req: Request, @Res() res: Response) {
    // return this.eventLogService.types(req, res);
  }
}
