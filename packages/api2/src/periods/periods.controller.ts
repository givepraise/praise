import {
  Controller,
  Get,
  Param,
  Query,
  SerializeOptions,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { ObjectIdPipe } from '@/shared/pipes/object-id.pipe';
import { PeriodsService } from './periods.service';
import { Period } from './schemas/periods.schema';
import { Permissions } from '@/auth/decorators/permissions.decorator';
import { Permission } from '@/auth/enums/permission.enum';
import { PaginationQuery } from '@/shared/dto/pagination-query.dto';
import { PeriodPaginationModelDto } from './dto/period-pagination-model.dto';
import { MongooseClassSerializerInterceptor } from '@/shared/mongoose-class-serializer.interceptor';

@Controller('periods')
@SerializeOptions({
  excludePrefixes: ['__'],
})
@UseInterceptors(MongooseClassSerializerInterceptor(Period))
export class PeriodsController {
  constructor(private readonly periodsService: PeriodsService) {}

  @Get()
  @ApiOperation({ summary: 'List all periods' })
  @ApiResponse({
    status: 200,
    description: 'Periods',
    type: PeriodPaginationModelDto,
  })
  @Permissions(Permission.PeriodView)
  async findAllPaginated(
    @Query() options: PaginationQuery,
  ): Promise<PeriodPaginationModelDto> {
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
}
