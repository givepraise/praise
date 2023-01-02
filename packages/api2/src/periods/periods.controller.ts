import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  SerializeOptions,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { Model, Types } from 'mongoose';
import { ObjectIdPipe } from '@/shared/pipes/object-id.pipe';
import { PeriodsService } from './periods.service';
import { Period } from './schemas/periods.schema';
import { Permissions } from '@/auth/decorators/permissions.decorator';
import { Permission } from '@/auth/enums/permission.enum';
import { PaginationModel } from '@/shared/dto/pagination-model.dto';
import { PaginationQuery } from '@/shared/dto/pagination-query.dto';
import { PermissionsGuard } from '@/auth/guards/permissions.guard';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { CreatePeriod } from './dto/create-period.dto';
import { UpdatePeriod } from './dto/update-period.dto';
import { Praise } from '@/praise/schemas/praise.schema';

@Controller('periods')
@SerializeOptions({
  excludePrefixes: ['__'],
})
@UseInterceptors(ClassSerializerInterceptor)
// @UseGuards(PermissionsGuard)
// @UseGuards(JwtAuthGuard)
export class PeriodsController {
  constructor(private readonly periodsService: PeriodsService) {}

  @Get()
  @ApiOperation({ summary: 'List all periods' })
  @ApiResponse({
    status: 200,
    description: 'Periods',
    type: Model<Period>,
  })
  @Permissions(Permission.PeriodView)
  async findAllPaginated(
    @Query() options: PaginationQuery,
  ): Promise<PaginationModel<Period>> {
    return this.periodsService.findAllPaginated(options);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find period by id' })
  @ApiResponse({
    status: 200,
    description: 'Period',
    type: Period,
  })
  @Permissions(Permission.PeriodView)
  @ApiParam({ name: 'id', type: String })
  async findOne(
    @Param('id', ObjectIdPipe) id: Types.ObjectId,
  ): Promise<Period> {
    return this.periodsService.findPeriodDetails(id);
  }

  @Post('/')
  @ApiOperation({ summary: 'Create a new period' })
  @ApiResponse({
    status: 200,
    description: 'Period',
    type: Period,
  })
  @Permissions(Permission.PeriodCreate)
  async create(@Body() createPeriodDto: CreatePeriod): Promise<Period> {
    return this.periodsService.create(createPeriodDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a period' })
  @ApiResponse({
    status: 200,
    description: 'Period',
    type: Period,
  })
  @Permissions(Permission.PeriodUpdate)
  @ApiParam({ name: 'id', type: String })
  async update(
    @Param('id', ObjectIdPipe) id: Types.ObjectId,
    @Body() updatePeriodDto: UpdatePeriod,
  ): Promise<Period> {
    return this.periodsService.update(id, updatePeriodDto);
  }

  @Patch(':id/close')
  @ApiOperation({ summary: 'Close a period' })
  @ApiResponse({
    status: 200,
    description: 'Period',
    type: Period,
  })
  @Permissions(Permission.PeriodUpdate)
  @ApiParam({ name: 'id', type: String })
  async close(@Param('id', ObjectIdPipe) id: Types.ObjectId): Promise<Period> {
    return this.periodsService.close(id);
  }

  @Get(':id/praise')
  @ApiOperation({ summary: 'Fetch all Praise in a period' })
  @ApiResponse({
    status: 200,
    description: 'Period Praise items',
    type: Period,
  })
  @Permissions(Permission.PeriodView)
  @ApiParam({ name: 'id', type: String })
  async praise(
    @Param('id', ObjectIdPipe) id: Types.ObjectId,
  ): Promise<Praise[]> {
    return this.periodsService.praise(id);
  }
}
