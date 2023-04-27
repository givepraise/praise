import * as fs from 'fs';
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Request,
  Res,
  SerializeOptions,
  UseInterceptors,
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
import { PraiseService } from './services/praise.service';
import { Praise, PraiseExportSqlSchema } from './schemas/praise.schema';
import { PraisePaginatedQueryDto } from './dto/praise-paginated-query.dto';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { Permission } from '../auth/enums/permission.enum';
import { MongooseClassSerializerInterceptor } from '../shared/interceptors/mongoose-class-serializer.interceptor';
import { PraisePaginatedResponseDto } from './dto/praise-paginated-response.dto';
import { Response } from 'express';
import { ExportInputDto } from '../shared/dto/export-input.dto';
import { exportTmpFilePath } from '../shared/fs.shared';
import { generateParquetExport } from '../shared/export.shared';
import { PraiseExportService } from './services/praise-export.service';
import { EnforceAuthAndPermissions } from '../auth/decorators/enforce-auth-and-permissions.decorator';
import { PraiseCreateInputDto } from './dto/praise-create-input.dto';
import { PraiseForwardInputDto } from './dto/praise-forward-input.dto';
import { EventLogService } from '../event-log/event-log.service';
import { RequestWithAuthContext } from '../auth/interfaces/request-with-auth-context.interface';
import { EventLogTypeKey } from '../event-log/enums/event-log-type-key';
import * as JSONStream from 'JSONStream';
import { Transform } from '@json2csv/node';
import { Public } from '../shared/decorators/public.decorator';

const exportIncludeFields = [
  '_id',
  'giver',
  'forwarder',
  'receiver',
  'reason',
  'reasonRaw',
  'score',
  'sourceId',
  'sourceName',
  'createdAt',
  'updatedAt',
];

@Controller('praise')
@ApiTags('Praise')
@SerializeOptions({
  excludePrefixes: ['__'],
})
@EnforceAuthAndPermissions()
export class PraiseController {
  constructor(
    private readonly praiseService: PraiseService,
    private readonly praiseExportService: PraiseExportService,
    private readonly eventLogService: EventLogService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List praise items, paginated results' })
  @ApiResponse({
    status: 200,
    description: 'Paginated praise items',
    type: PraisePaginatedResponseDto,
  })
  @UseInterceptors(MongooseClassSerializerInterceptor(Praise))
  @Permissions(Permission.PraiseView)
  async findAllPaginated(
    @Query() options: PraisePaginatedQueryDto,
  ): Promise<PraisePaginatedResponseDto> {
    return this.praiseService.findAllPaginated(options);
  }

  @Get('export/json')
  @ApiOperation({ summary: 'Export praise document to json' })
  @ApiOkResponse({
    schema: {
      type: 'string',
      format: 'binary',
    },
  })
  @ApiProduces('application/json')
  @Public()
  @Permissions(Permission.PraiseExport)
  async exportJson(@Query() options: ExportInputDto, @Res() res: Response) {
    res.set({
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="praise.json"`,
    });

    // Create a cursor to the praise collection
    const praiseCursor = await this.praiseExportService.exportCursor(
      options,
      exportIncludeFields,
    );

    // Close the cursor when the response is closed
    res.on('close', () => {
      praiseCursor.close();
    });

    praiseCursor.pipe(JSONStream.stringify()).pipe(res);
  }

  @Get('export/csv')
  @ApiOperation({ summary: 'Export praise document to csv' })
  @ApiOkResponse({
    schema: {
      type: 'string',
      format: 'binary',
    },
  })
  @ApiProduces('text/csv')
  @Public()
  @Permissions(Permission.PraiseExport)
  async exportCsv(@Query() options: ExportInputDto, @Res() res: Response) {
    res.set({
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="praise.csv"`,
    });

    // Create a cursor to the praise collection
    const praiseCursor = await this.praiseExportService.exportCursor(
      options,
      exportIncludeFields,
    );

    // Create a transformer to convert the JSON data to CSV
    const csvTransformer = new Transform(
      { fields: exportIncludeFields },
      { objectMode: true },
    );

    // Close the cursor when the response is closed
    res.on('close', () => {
      praiseCursor.close();
    });

    praiseCursor.pipe(csvTransformer).pipe(res);
  }

  @Get('export/parquet')
  @ApiOperation({ summary: 'Export praise document to parquet' })
  @ApiOkResponse({
    schema: {
      type: 'string',
      format: 'binary',
    },
  })
  @ApiProduces('application/octet-stream')
  @Public()
  @Permissions(Permission.PraiseExport)
  async exportParquet(@Query() options: ExportInputDto, @Res() res: Response) {
    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="praise.parquet"`,
    });

    // Tmp file paths
    const tmpCsvPath = exportTmpFilePath('praise.csv');
    const tmpParquetPath = exportTmpFilePath('praise.parquet');

    // Create a cursor to the praise collection
    const praiseCursor = await this.praiseExportService.exportCursor(
      options,
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
    praiseCursor.pipe(csvTransformer).pipe(writableStream);

    // When the CSV data is finished, convert it to Parquet and send it as a response
    writableStream.on('finish', async () => {
      // Convert the CSV file to Parquet
      await generateParquetExport(
        'praise',
        PraiseExportSqlSchema,
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

  @Get(':id')
  @ApiOperation({ summary: 'Find praise item by id' })
  @ApiResponse({
    status: 200,
    description: 'Praise item',
    type: Praise,
  })
  @Permissions(Permission.PraiseView)
  @UseInterceptors(MongooseClassSerializerInterceptor(Praise))
  @ApiParam({ name: 'id', type: 'string' })
  async findOne(
    @Param('id', ObjectIdPipe) id: Types.ObjectId,
  ): Promise<Praise> {
    return this.praiseService.findOneById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create praise item' })
  @ApiResponse({
    status: 200,
    description: 'Praise item',
    type: Praise,
  })
  @Permissions(Permission.PraiseCreate)
  @UseInterceptors(MongooseClassSerializerInterceptor(Praise))
  async praise(
    @Request() request: RequestWithAuthContext,
    @Body() data: PraiseCreateInputDto,
  ): Promise<Praise[]> {
    const praiseItem = await this.praiseService.createPraiseItem(data);

    await this.eventLogService.logEventWithAuthContext({
      authContext: request.authContext,
      typeKey: EventLogTypeKey.PRAISE,
      description: `Giver ${data.giver} created an Praise item with receiver IDS ${data.receiverIds}`,
    });

    return praiseItem;
  }

  @Post('forward')
  @ApiOperation({ summary: 'Forward praise item' })
  @ApiResponse({
    status: 200,
    description: 'Praise item',
    type: Praise,
  })
  @Permissions(Permission.PraiseForward)
  @UseInterceptors(MongooseClassSerializerInterceptor(Praise))
  async forward(
    @Request() request: RequestWithAuthContext,
    @Body() data: PraiseForwardInputDto,
  ): Promise<Praise[]> {
    const praiseItem = await this.praiseService.createPraiseItem(data);

    await this.eventLogService.logEventWithAuthContext({
      authContext: request.authContext,
      typeKey: EventLogTypeKey.PRAISE,
      description: `Forwarder ${data.forwarder} created an Praise item with receiver IDS ${data.receiverIds}`,
    });

    return praiseItem;
  }
}
