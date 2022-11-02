import { Controller, Get, Param } from '@nestjs/common';
import { EventLogService } from './event-log.service';

@Controller('event-log')
export class EventLogController {
  constructor(private readonly eventLogService: EventLogService) {}

  @Get()
  findAll() {
    return this.eventLogService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventLogService.findOne(+id);
  }
}
