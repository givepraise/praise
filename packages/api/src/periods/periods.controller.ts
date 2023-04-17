import * as fs from 'fs';
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
  StreamableFile,
  Request,
} from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiProduces,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Types } from 'mongoose';
import { ObjectIdPipe } from '../shared/pipes/object-id.pipe';
import { PeriodsService } from './services/periods.service';
import { Period } from './schemas/periods.schema';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { Permission } from '../auth/enums/permission.enum';
import { MongooseClassSerializerInterceptor } from '../shared/interceptors/mongoose-class-serializer.interceptor';
import { PeriodPaginatedResponseDto } from './dto/period-paginated-response.dto';
import { PaginatedQueryDto } from '../shared/dto/pagination-query.dto';
import { CreatePeriodInputDto } from './dto/create-period-input.dto';
import { UpdatePeriodInputDto } from './dto/update-period-input.dto';
import { VerifyQuantifierPoolSizeDto } from './dto/verify-quantifiers-pool-size.dto';
import { PeriodDetailsDto } from './dto/period-details.dto';
import { ReplaceQuantifierInputDto } from './dto/replace-quantifier-input.dto';
import { ReplaceQuantifierResponseDto } from './dto/replace-quantifier-response.dto';
import { PeriodAssignmentsService } from './services/period-assignments.service';
import { PraiseWithUserAccountsWithUserRefDto } from '../praise/dto/praise-with-user-accounts-with-user-ref.dto';
import { Response } from 'express';
import { allExportsDirPath } from '../shared/fs.shared';
import { ExportInputFormatOnlyDto } from '../shared/dto/export-input-format-only';
import { exportContentType } from '../shared/export.shared';
import { EnforceAuthAndPermissions } from '../auth/decorators/enforce-auth-and-permissions.decorator';
import { ApiException } from '../shared/exceptions/api-exception';
import { errorMessages } from '../shared/exceptions/error-messages';
import { EventLogService } from 'src/event-log/event-log.service';
import { RequestWithAuthContext } from 'src/auth/interfaces/request-with-auth-context.interface';
import { EventLogTypeKey } from 'src/event-log/enums/event-log-type-key';

@Controller('periods')
@ApiTags('Periods')
@SerializeOptions({
  excludePrefixes: ['__'],
})
@EnforceAuthAndPermissions()
export class PeriodsController {
  constructor(
    private readonly periodsService: PeriodsService,
    private readonly periodAssignmentsService: PeriodAssignmentsService,
    private readonly eventLogService: EventLogService,
  ) {}

  @Get('export')
  @ApiOperation({ summary: 'Export periods document to json or csv' })
  @ApiOkResponse({
    schema: {
      type: 'string',
      format: 'binary',
    },
  })
  @ApiProduces('application/octet-stream')
  @ApiProduces('application/json')
  @Permissions(Permission.PeriodExport)
  async export(
    @Query() options: ExportInputFormatOnlyDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const format = options.format || 'csv';

    // Root path for all exports
    const rootPath = `${allExportsDirPath}/periods`;

    // Directory level 1 is the latest periods id
    const latestPeriod = await this.periodsService.findLatestAdded();
    if (!latestPeriod) {
      throw new ApiException(errorMessages.NO_PERIODS_TO_EXPORT);
    }

    const dirLevel1 = latestPeriod._id.toString();
    const dirPath = `${rootPath}/${dirLevel1}`;
    const filePath = `${dirPath}/periods.${format}`;

    if (!fs.existsSync(filePath)) {
      // If cached export don't exist
      if (!fs.existsSync(`${rootPath}/${dirLevel1}`)) {
        // If the latest periods id folder doesn't exist,
        // database hase been updated, clear all cached exports
        fs.rmSync(rootPath, { recursive: true, force: true });
      }

      // Create directory for new export
      fs.mkdirSync(dirPath, { recursive: true });

      // Generate new export files
      await this.periodsService.generateAllExports(dirPath);
    }

    res.set({
      'Content-Type': exportContentType(format),
      'Content-Disposition': `attachment; filename="periods.${format}"`,
    });

    const file = fs.createReadStream(filePath);
    return new StreamableFile(file);
  }

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
  @ApiParam({ name: 'id', type: 'string' })
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
    @Request() request: RequestWithAuthContext,
    @Body() createPeriodDto: CreatePeriodInputDto,
  ): Promise<PeriodDetailsDto> {
    const period = this.periodsService.create(createPeriodDto);

    await this.eventLogService.logEventWithAuthContext({
      authContext: request.authContext,
      typeKey: EventLogTypeKey.PERIOD,
      description: `User ${request.authContext.userId} created an PERIOD`,
    });

    return period;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a period' })
  @ApiResponse({
    status: 200,
    description: 'Period',
    type: PeriodDetailsDto,
  })
  @Permissions(Permission.PeriodUpdate)
  @ApiParam({ name: 'id', type: 'string' })
  @UseInterceptors(MongooseClassSerializerInterceptor(PeriodDetailsDto))
  async update(
    @Param('id', ObjectIdPipe) id: Types.ObjectId,
    @Body() updatePeriodDto: UpdatePeriodInputDto,
    @Request() request: RequestWithAuthContext,
  ): Promise<PeriodDetailsDto> {
    const period = this.periodsService.update(id, updatePeriodDto);

    await this.eventLogService.logEventWithAuthContext({
      authContext: request.authContext,
      typeKey: EventLogTypeKey.PERIOD,
      description: `User ${
        request.authContext.userId
      } updated an PERIOD ${id} with data ${JSON.stringify(updatePeriodDto)}`,
    });

    return period;
  }

  @Patch(':id/close')
  @ApiOperation({ summary: 'Close a period' })
  @ApiResponse({
    status: 200,
    description: 'Period',
    type: PeriodDetailsDto,
  })
  @Permissions(Permission.PeriodUpdate)
  @ApiParam({ name: 'id', type: 'string' })
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
  @ApiParam({ name: 'id', type: 'string' })
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
  @ApiParam({ name: 'periodId', type: 'string' })
  @ApiParam({ name: 'receiverId', type: 'string' })
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
  @ApiParam({ name: 'periodId', type: 'string' })
  @ApiParam({ name: 'giverId', type: 'string' })
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
  @ApiParam({ name: 'periodId', type: 'string' })
  @ApiParam({ name: 'quantifierId', type: 'string' })
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
  @ApiParam({ name: 'id', type: 'string' })
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
  @ApiParam({ name: 'id', type: 'string' })
  @UseInterceptors(MongooseClassSerializerInterceptor(PeriodDetailsDto))
  async assignQuantifiers(
    @Param('id', ObjectIdPipe) id: Types.ObjectId,
    @Request() request: RequestWithAuthContext,
  ): Promise<PeriodDetailsDto> {
    const periodDetails = this.periodAssignmentsService.assignQuantifiers(id);

    await this.eventLogService.logEventWithAuthContext({
      authContext: request.authContext,
      typeKey: EventLogTypeKey.PERIOD,
      description: `Assigned random quantifiers to all praise in period "${id}"`,
    });

    return periodDetails;
  }

  @Patch(':id/replaceQuantifier')
  @ApiOperation({ summary: 'Replace quantifier in period' })
  @ApiResponse({
    status: 200,
    description: 'Period',
    type: ReplaceQuantifierResponseDto,
  })
  @Permissions(Permission.PeriodAssign)
  @ApiParam({ name: 'id', type: 'string' })
  async replaceQuantifier(
    @Param('id', ObjectIdPipe) id: Types.ObjectId,
    @Body() replaceQuantifierDto: ReplaceQuantifierInputDto,
    @Request() request: RequestWithAuthContext,
  ): Promise<ReplaceQuantifierResponseDto> {
    const replaceQuantifierResponse =
      this.periodAssignmentsService.replaceQuantifier(id, replaceQuantifierDto);

    await this.eventLogService.logEventWithAuthContext({
      authContext: request.authContext,
      typeKey: EventLogTypeKey.PERIOD,
      description: `Reassigned all praise in period "${id}" that is currently assigned to user with id "${replaceQuantifierDto.currentQuantifierId}", to user with id "${replaceQuantifierDto.newQuantifierId}"`,
    });

    return replaceQuantifierResponse;
  }
}
