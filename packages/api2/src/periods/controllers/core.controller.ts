import { Body, Get, Param } from '@nestjs/common';
import { ApiParam } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { ObjectIdPipe } from 'src/objectId.pipe';
import { CreatePeriodDto } from '../dto/create-period.dto';
import { PeriodsService } from '../periods.service';
import { Period } from '../schemas/periods.schema';

export class CoreController {
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

  @Get('create')
  @ApiParam({ name: 'id', type: String })
  async create(@Body() createPeriodDto: CreatePeriodDto): Promise<Period> {
    return this.periodsService.createPeriod(createPeriodDto);
  }
}
