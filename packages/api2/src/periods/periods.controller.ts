import { Controller, Get, Param } from '@nestjs/common';
import { ApiParam } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { ObjectIdPipe } from 'src/objectId.pipe';
import { PeriodsService } from './periods.service';
import { Period } from './schemas/periods.schema';

@Controller('periods')
export class PeriodsController {
  constructor(private readonly periodsService: PeriodsService) {}

  @Get()
  async findAll(): Promise<Period[]> {
    return this.periodsService.findAll();
  }

  @Get(':id')
  @ApiParam({ name: 'id', type: String })
  async findOne(
    @Param('id', ObjectIdPipe) id: Types.ObjectId,
  ): Promise<Period> {
    return this.periodsService.findOneById(id);
  }
}
