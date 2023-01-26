import {
  Query,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  SerializeOptions,
  UseInterceptors,
  Res,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { ObjectIdPipe } from '@/shared/pipes/object-id.pipe';
import { PeriodsService } from './services/periods.service';
import { Period } from './schemas/periods.schema';
import { Permissions } from '@/auth/decorators/permissions.decorator';
import { Permission } from '@/auth/enums/permission.enum';
import { MongooseClassSerializerInterceptor } from '@/shared/mongoose-class-serializer.interceptor';
import { PeriodPaginatedResponseDto } from './dto/period-paginated-response.dto';
import { PaginatedQueryDto } from '@/shared/dto/pagination-query.dto';
import { CreatePeriodInputDto } from './dto/create-period-input.dto';
import { UpdatePeriodInputDto } from './dto/update-period-input.dto';
import { VerifyQuantifierPoolSizeDto } from './dto/verify-quantifiers-pool-size.dto';
import { PeriodDetailsDto } from './dto/period-details.dto';
import { ReplaceQuantifierInputDto } from './dto/replace-quantifier-input.dto';
import { ReplaceQuantifierResponseDto } from './dto/replace-quantifier-reponse.dto';
import { PeriodAssignmentsService } from './services/period-assignments.service';
import { PraiseModel } from '@/database/schemas/praise/12_praise.schema';
import { PraiseWithUserAccountsWithUserRefDto } from '@/praise/dto/praise-with-user-accounts-with-user-ref.dto';
import { Response } from 'express';
import { ExportRequestOptions } from '@/shared/dto/export-request-options.dto';

@Controller('periods')
@ApiTags('Periods')
@SerializeOptions({
  excludePrefixes: ['__'],
})
// @UseGuards(PermissionsGuard)
// @UseGuards(JwtAuthGuard)
export class PeriodsController {
  constructor(
    private readonly periodsService: PeriodsService,
    private readonly periodAssignmentsService: PeriodAssignmentsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List all periods' })
  @ApiResponse({
    status: 200,
    description: 'Periods',
    type: PeriodPaginatedResponseDto,
  })
  @Permissions(Permission.PeriodView)
  @UseInterceptors(MongooseClassSerializerInterceptor(Period))
  async findAllPaginated(
    @Query() options: PaginatedQueryDto,
  ): Promise<PeriodPaginatedResponseDto> {
    return this.periodsService.findAllPaginated(options);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find period by id' })
  @ApiResponse({
    status: 200,
    description: 'Period',
    type: PeriodDetailsDto,
  })
  @Permissions(Permission.PeriodView)
  @ApiParam({ name: 'id', type: String })
  @UseInterceptors(MongooseClassSerializerInterceptor(PeriodDetailsDto))
  async findOne(
    @Param('id', ObjectIdPipe) id: Types.ObjectId,
  ): Promise<PeriodDetailsDto> {
    return this.periodsService.findPeriodDetails(id);
  }

  @Post('/')
  @ApiOperation({ summary: 'Create a new period' })
  @ApiResponse({
    status: 200,
    description: 'Period',
    type: PeriodDetailsDto,
  })
  @Permissions(Permission.PeriodCreate)
  @UseInterceptors(MongooseClassSerializerInterceptor(PeriodDetailsDto))
  async create(
    @Body() createPeriodDto: CreatePeriodInputDto,
  ): Promise<PeriodDetailsDto> {
    return this.periodsService.create(createPeriodDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a period' })
  @ApiResponse({
    status: 200,
    description: 'Period',
    type: PeriodDetailsDto,
  })
  @Permissions(Permission.PeriodUpdate)
  @ApiParam({ name: 'id', type: String })
  @UseInterceptors(MongooseClassSerializerInterceptor(PeriodDetailsDto))
  async update(
    @Param('id', ObjectIdPipe) id: Types.ObjectId,
    @Body() updatePeriodDto: UpdatePeriodInputDto,
  ): Promise<PeriodDetailsDto> {
    return this.periodsService.update(id, updatePeriodDto);
  }

  @Patch(':id/close')
  @ApiOperation({ summary: 'Close a period' })
  @ApiResponse({
    status: 200,
    description: 'Period',
    type: PeriodDetailsDto,
  })
  @Permissions(Permission.PeriodUpdate)
  @ApiParam({ name: 'id', type: String })
  @UseInterceptors(MongooseClassSerializerInterceptor(PeriodDetailsDto))
  async close(
    @Param('id', ObjectIdPipe) id: Types.ObjectId,
  ): Promise<PeriodDetailsDto> {
    return this.periodsService.close(id);
  }

  @Get(':id/praise')
  @ApiOperation({ summary: 'Fetch all Praise in a period' })
  @ApiResponse({
    status: 200,
    description: 'Period Praise items',
    type: [PraiseWithUserAccountsWithUserRefDto],
  })
  @Permissions(Permission.PeriodView)
  @ApiParam({ name: 'id', type: String })
  @UseInterceptors(
    MongooseClassSerializerInterceptor(PraiseWithUserAccountsWithUserRefDto),
  )
  async praise(
    @Param('id', ObjectIdPipe) id: Types.ObjectId,
  ): Promise<PraiseWithUserAccountsWithUserRefDto[]> {
    return this.periodsService.findAllPraise(id);
  }

  @Get(':periodId/praise/receiver/:receiverId')
  @ApiOperation({
    summary: 'Fetch all Praise in a period for a given receiver',
  })
  @ApiResponse({
    status: 200,
    description: 'Period Praise items',
    type: [PraiseWithUserAccountsWithUserRefDto],
  })
  @Permissions(Permission.PeriodView)
  @ApiParam({ name: 'periodId', type: String })
  @ApiParam({ name: 'receiverId', type: String })
  @UseInterceptors(
    MongooseClassSerializerInterceptor(PraiseWithUserAccountsWithUserRefDto),
  )
  async praiseByReceiver(
    @Param('periodId', ObjectIdPipe) periodId: Types.ObjectId,
    @Param('receiverId', ObjectIdPipe) receiverId: Types.ObjectId,
  ): Promise<PraiseWithUserAccountsWithUserRefDto[]> {
    return this.periodsService.findAllPraiseByReceiver(periodId, receiverId);
  }

  @Get(':periodId/praise/giver/:giverId')
  @ApiOperation({
    summary: 'Fetch all Praise in a period for a given giver',
  })
  @ApiResponse({
    status: 200,
    description: 'Period Praise items',
    type: [PraiseWithUserAccountsWithUserRefDto],
  })
  @Permissions(Permission.PeriodView)
  @ApiParam({ name: 'periodId', type: String })
  @ApiParam({ name: 'giverId', type: String })
  @UseInterceptors(
    MongooseClassSerializerInterceptor(PraiseWithUserAccountsWithUserRefDto),
  )
  async praiseByGiver(
    @Param('periodId', ObjectIdPipe) periodId: Types.ObjectId,
    @Param('giverId', ObjectIdPipe) giverId: Types.ObjectId,
  ): Promise<PraiseWithUserAccountsWithUserRefDto[]> {
    return this.periodsService.findAllPraiseByGiver(periodId, giverId);
  }

  @Get(':periodId/praise/quantifier/:quantifierId')
  @ApiOperation({
    summary: 'Fetch all Praise in a period for a given quantifier',
  })
  @ApiResponse({
    status: 200,
    description: 'Period Praise items',
    type: [PraiseWithUserAccountsWithUserRefDto],
  })
  @Permissions(Permission.PeriodView)
  @ApiParam({ name: 'periodId', type: String })
  @ApiParam({ name: 'quantifierId', type: String })
  @UseInterceptors(
    MongooseClassSerializerInterceptor(PraiseWithUserAccountsWithUserRefDto),
  )
  async praiseByQuantifier(
    @Param('periodId', ObjectIdPipe) periodId: Types.ObjectId,
    @Param('quantifierId', ObjectIdPipe) quantifierId: Types.ObjectId,
  ): Promise<PraiseWithUserAccountsWithUserRefDto[]> {
    return this.periodsService.findAllPraiseByQuantifier(
      periodId,
      quantifierId,
    );
  }

  @Get(':id/verifyQuantifierPoolSize')
  @ApiOperation({ summary: 'Verify quantifier pool size' })
  @ApiResponse({
    status: 200,
    description: 'Period',
    type: VerifyQuantifierPoolSizeDto,
  })
  @Permissions(Permission.PeriodAssign)
  @ApiParam({ name: 'id', type: String })
  async verifyQuantifierPoolSize(
    @Param('id', ObjectIdPipe) id: Types.ObjectId,
  ): Promise<VerifyQuantifierPoolSizeDto> {
    return this.periodAssignmentsService.verifyQuantifierPoolSize(id);
  }

  @Patch(':id/assignQuantifiers')
  @ApiOperation({ summary: 'Assign quantifiers to period' })
  @ApiResponse({
    status: 200,
    description: 'Period',
    type: PeriodDetailsDto,
  })
  @Permissions(Permission.PeriodAssign)
  @ApiParam({ name: 'id', type: String })
  @UseInterceptors(MongooseClassSerializerInterceptor(PeriodDetailsDto))
  async assignQuantifiers(
    @Param('id', ObjectIdPipe) id: Types.ObjectId,
  ): Promise<PeriodDetailsDto> {
    return this.periodAssignmentsService.assignQuantifiers(id);
  }

  @Patch(':id/replaceQuantifier')
  @ApiOperation({ summary: 'Replace quantifier in period' })
  @ApiResponse({
    status: 200,
    description: 'Period',
    type: ReplaceQuantifierResponseDto,
  })
  @Permissions(Permission.PeriodAssign)
  @ApiParam({ name: 'id', type: String })
  async replaceQuantifier(
    @Param('id', ObjectIdPipe) id: Types.ObjectId,
    @Body() replaceQuantifierDto: ReplaceQuantifierInputDto,
  ): Promise<ReplaceQuantifierResponseDto> {
    return this.periodAssignmentsService.replaceQuantifier(
      id,
      replaceQuantifierDto,
    );
  }

  @Get('export')
  @ApiOperation({ summary: 'Export periods document to json or csv' })
  @ApiResponse({
    status: 200,
    description: 'Periods Export',
    type: [Period],
  })
  @Permissions(Permission.PeriodExport)
  @ApiParam({ name: 'format', type: String })
  async export(
    @Query() options: ExportRequestOptions,
    @Res() res: Response,
  ): Promise<Period[] | Response<string>> {
    const periods = await this.periodsService.export(options.format);

    if (options.format === 'json') return periods as Period[];

    res.header('Content-Type', 'text/csv');
    res.attachment('periods.csv');
    return res.send(periods);
  }
}
