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
import { Period, PeriodExportSqlSchema } from './schemas/periods.schema';
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
import { exportTmpFilePath } from '../shared/fs.shared';
import { generateParquetExport } from '../shared/export.shared';
import { EnforceAuthAndPermissions } from '../auth/decorators/enforce-auth-and-permissions.decorator';
import { EventLogService } from '../event-log/event-log.service';
import { RequestWithAuthContext } from '../auth/interfaces/request-with-auth-context.interface';
import { EventLogTypeKey } from '../event-log/enums/event-log-type-key';
import * as JSONStream from 'JSONStream';
import { Transform } from '@json2csv/node';
import { Public } from '../shared/decorators/public.decorator';

const exportIncludeFields = [
  '_id',
  'name',
  'status',
  'endDate',
  'createdAt',
  'updatedAt',
];

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

  @Get('export/json')
  @ApiOperation({ summary: 'Export periods document to json' })
  @ApiOkResponse({
    schema: {
      type: 'string',
      format: 'binary',
    },
  })
  @ApiProduces('application/json')
  @Public()
  @Permissions(Permission.PeriodExport)
  async exportJson(@Res() res: Response) {
    res.set({
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="periods.json"`,
    });

    // Create a cursor to the periods collection
    const periodsCursor = await this.periodsService.exportCursor(
      exportIncludeFields,
    );

    // Close the cursor when the response is closed
    res.on('close', () => {
      periodsCursor.close();
    });

    periodsCursor.pipe(JSONStream.stringify()).pipe(res);
  }

  @Get('export/csv')
  @ApiOperation({ summary: 'Export periods document to csv' })
  @ApiOkResponse({
    schema: {
      type: 'string',
      format: 'binary',
    },
  })
  @ApiProduces('text/csv')
  @Public()
  @Permissions(Permission.PeriodExport)
  async exportCsv(@Res() res: Response) {
    res.set({
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="periods.csv"`,
    });

    // Create a cursor to the periods collection
    const periodsCursor = await this.periodsService.exportCursor(
      exportIncludeFields,
    );

    // Create a transformer to convert the JSON data to CSV
    const csvTransformer = new Transform(
      { fields: exportIncludeFields },
      { objectMode: true },
    );

    // Close the cursor when the response is closed
    res.on('close', () => {
      periodsCursor.close();
    });

    periodsCursor.pipe(csvTransformer).pipe(res);
  }

  @Get('export/parquet')
  @ApiOperation({ summary: 'Export periods document to parquet' })
  @ApiOkResponse({
    schema: {
      type: 'string',
      format: 'binary',
    },
  })
  @ApiProduces('application/octet-stream')
  @Public()
  @Permissions(Permission.PeriodExport)
  async exportParquet(@Res() res: Response) {
    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="periods.parquet"`,
    });

    // Tmp file paths
    const tmpCsvPath = exportTmpFilePath('periods.csv');
    const tmpParquetPath = exportTmpFilePath('periods.parquet');

    // Create a cursor to the periods collection
    const periodsCursor = await this.periodsService.exportCursor(
      exportIncludeFields,
    );

    // Create a writable stream to the temporary csv file
    const writableStream = fs.createWriteStream(tmpCsvPath);

    // Create a transformer to convert the JSON data to CSV
    const csvTransformer = new Transform(
      { fields: exportIncludeFields },
      { objectMode: true },
    );

    // Pipe the CSV data to the temporary file
    periodsCursor.pipe(csvTransformer).pipe(writableStream);

    // When the CSV data is finished, convert it to Parquet and send it as a response
    writableStream.on('finish', async () => {
      // Convert the CSV file to Parquet
      await generateParquetExport(
        'periods',
        PeriodExportSqlSchema,
        tmpCsvPath,
        tmpParquetPath,
      );

      // Read temporary parquet file and send it as a response
      const readableStream = fs.createReadStream(tmpParquetPath);
      readableStream.pipe(res);

      // Clean up!
      res.on('finish', () => {
        fs.unlinkSync(tmpCsvPath);
        fs.unlinkSync(tmpParquetPath);
      });
    });
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
    const period = await this.periodsService.create(createPeriodDto);

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
    const period = await this.periodsService.update(id, updatePeriodDto);

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
    const periodDetails = await this.periodAssignmentsService.assignQuantifiers(
      id,
    );

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
      await this.periodAssignmentsService.replaceQuantifier(
        id,
        replaceQuantifierDto,
      );

    await this.eventLogService.logEventWithAuthContext({
      authContext: request.authContext,
      typeKey: EventLogTypeKey.PERIOD,
      description: `Reassigned all praise in period "${id}" that is currently assigned to user with id "${replaceQuantifierDto.currentQuantifierId}", to user with id "${replaceQuantifierDto.newQuantifierId}"`,
    });

    return replaceQuantifierResponse;
  }
}
