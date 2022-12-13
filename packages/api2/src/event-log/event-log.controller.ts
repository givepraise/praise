import { Controller, Get, Query, Req, Res } from '@nestjs/common';
import { EventLogService } from './event-log.service';
import { Request, Response } from 'express';
import { PaginationQuery } from '@/shared/dto/pagination-query.dto';

@Controller('event-log')
export class EventLogController {
  constructor(private readonly eventLogService: EventLogService) {}

  @Get()
  findAll(@Query() paginationQuery: PaginationQuery) {
    console.log('paginationQuery', paginationQuery);
    //return this.eventLogService.findAll(req, res);
  }

  @Get('types')
  types(@Req() req: Request, @Res() res: Response) {
    return this.eventLogService.types(req, res);
  }
}
