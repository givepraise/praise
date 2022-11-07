import { Controller, Get, Req, Res } from '@nestjs/common';
import { EventLogService } from './event-log.service';
import { Request, Response } from 'express';

@Controller('event-log')
export class EventLogController {
  constructor(private readonly eventLogService: EventLogService) {}

  @Get('all')
  findAll(@Req() req: Request, @Res() res: Response) {
    return this.eventLogService.findAll(req, res);
  }

  @Get('type')
  types(@Req() req: Request, @Res() res: Response) {
    return this.eventLogService.types(req, res);
  }
}
