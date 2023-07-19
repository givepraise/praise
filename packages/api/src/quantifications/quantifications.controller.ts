import * as fs from 'fs';
import {
  Controller,
  Get,
  Query,
  Res,
  SerializeOptions,
  Patch,
  Param,
  Body,
  UseInterceptors,
  Request,
} from '@nestjs/common';
import { ApiOkResponse, ApiParam, ApiProduces, ApiTags } from '@nestjs/swagger';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { QuantificationsService } from './services/quantifications.service';
import { Response } from 'express';
import { ExportInputDto } from '../shared/dto/export-input.dto';
import { exportTmpFilePath } from '../shared/fs.shared';
import { generateParquetExport } from '../shared/export.shared';
import { QuantificationsExportService } from './services/quantifications-export.service';
import { EnforceAuthAndPermissions } from '../auth/decorators/enforce-auth-and-permissions.decorator';
import { Permission } from '../auth/enums/permission.enum';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { errorMessages } from '../shared/exceptions/error-messages';
import { ApiException } from '../shared/exceptions/api-exception';
import { Praise } from '../praise/schemas/praise.schema';
import { MongooseClassSerializerInterceptor } from '../shared/interceptors/mongoose-class-serializer.interceptor';
import { ObjectIdPipe } from '../shared/pipes/object-id.pipe';
import { QuantifyInputDto } from './dto/quantify-input.dto';
import { RequestWithAuthContext } from '../auth/interfaces/request-with-auth-context.interface';
import { Types } from 'mongoose';
import { QuantifyMultipleInputDto } from './dto/quantify-multiple-input.dto';
import { EventLogService } from '../event-log/event-log.service';
import { EventLogTypeKey } from '../event-log/enums/event-log-type-key';
import * as JSONStream from 'JSONStream';
import { Transform } from '@json2csv/node';
import { QuantificationsExportSqlSchema } from './schemas/quantifications.schema';
import { Public } from '../shared/decorators/public.decorator';
import { UsersService } from '../users/users.service';

// Fields to include in the csv
const exportIncludeFields = [
  '_id',
  'praise',
  'quantifier',
  'score',
  'scoreRealized',
  'dismissed',
  'duplicatePraise',
  'createdAt',
  'updatedAt',
];
@Controller('quantifications')
@ApiTags('Quantifications')
@SerializeOptions({
  excludePrefixes: ['__'],
})
@EnforceAuthAndPermissions()
export class QuantificationsController {
  constructor(
    private readonly quantificationsService: QuantificationsService,
    private readonly quantificationsExportService: QuantificationsExportService,
    private readonly eventLogService: EventLogService,
    private readonly usersService: UsersService,
  ) {}

  @Get('export/json')
  @ApiOperation({ summary: 'Export quantifications document to json' })
  @ApiOkResponse({
    schema: {
      type: 'string',
      format: 'binary',
    },
  })
  @ApiProduces('application/json')
  @Public()
  @Permissions(Permission.QuantificationsExport)
  async exportJson(@Query() options: ExportInputDto, @Res() res: Response) {
    res.set({
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="quantifications.json"`,
    });

    // Create a cursor to the quantifications collection
    const quantificationsCursor =
      await this.quantificationsExportService.exportCursor(options);

    // Close the cursor when the response is closed
    res.on('close', () => {
      quantificationsCursor.close();
    });

    quantificationsCursor.pipe(JSONStream.stringify()).pipe(res);
  }

  @Get('export/csv')
  @ApiOperation({ summary: 'Export quantifications document to csv' })
  @ApiOkResponse({
    schema: {
      type: 'string',
      format: 'binary',
    },
  })
  @ApiProduces('text/csv')
  @Public()
  @Permissions(Permission.QuantificationsExport)
  async exportCsv(@Query() options: ExportInputDto, @Res() res: Response) {
    res.set({
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="quantifications.csv"`,
    });

    // Create a cursor to the quantifications collection
    const quantificationsCursor =
      await this.quantificationsExportService.exportCursor(options);

    // Create a transformer to convert the JSON data to CSV
    const csvTransformer = new Transform(
      { fields: exportIncludeFields },
      { objectMode: true },
    );

    // Close the cursor when the response is closed
    res.on('close', () => {
      quantificationsCursor.close();
    });

    quantificationsCursor.pipe(csvTransformer).pipe(res);
  }

  @Get('export/parquet')
  @ApiOperation({ summary: 'Export quantifications document to parquet' })
  @ApiOkResponse({
    schema: {
      type: 'string',
      format: 'binary',
    },
  })
  @ApiProduces('application/octet-stream')
  @Public()
  @Permissions(Permission.QuantificationsExport)
  async exportParquet(@Query() options: ExportInputDto, @Res() res: Response) {
    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="quantifications.parquet"`,
    });

    // Tmp file paths
    const tmpCsvPath = exportTmpFilePath('quantifications.csv');
    const tmpParquetPath = exportTmpFilePath('quantifications.parquet');

    // Create a cursor to the quantifications collection
    const quantificationsCursor =
      await this.quantificationsExportService.exportCursor(options);

    // Create a writable stream to the temporary csv file
    const writableStream = fs.createWriteStream(tmpCsvPath);

    // Create a transformer to convert the JSON data to CSV
    const csvTransformer = new Transform(
      { fields: exportIncludeFields },
      { objectMode: true },
    );

    // Pipe the CSV data to the temporary file
    quantificationsCursor.pipe(csvTransformer).pipe(writableStream);

    // When the CSV data is finished, convert it to Parquet and send it as a response
    writableStream.on('finish', async () => {
      // Convert the CSV file to Parquet
      await generateParquetExport(
        'quantifications',
        QuantificationsExportSqlSchema,
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

  @Patch('multiple')
  @ApiOperation({ summary: 'Quantify multiple praise items' })
  @ApiResponse({
    status: 200,
    description: 'Praise items',
    type: [Praise],
  })
  @Permissions(Permission.PraiseQuantify)
  @UseInterceptors(MongooseClassSerializerInterceptor(Praise))
  async quantifyMultiple(
    @Body() data: QuantifyMultipleInputDto,
    @Request() request: RequestWithAuthContext,
  ): Promise<Praise[]> {
    const { praiseIds, params } = data;

    const userId = new Types.ObjectId(request.authContext?.userId);
    if (!userId) {
      throw new ApiException(errorMessages.USER_NOT_FOUND);
    }

    if (!Array.isArray(praiseIds)) {
      throw new ApiException(errorMessages.PRAISE_IDS_MUST_BE_ARRAY);
    }

    const praiseItems = await Promise.all(
      praiseIds.map(async (praiseId) => {
        const affectedPraises =
          await this.quantificationsService.quantifyPraise(
            userId,
            new Types.ObjectId(praiseId),
            params,
          );

        return affectedPraises;
      }),
    );

    await this.eventLogService.logEventWithAuthContext({
      authContext: request.authContext,
      typeKey: EventLogTypeKey.USER_ACCOUNT,
      description: `User ${userId} quantified a multiple Praise items ${JSON.stringify(
        praiseIds,
      )}`,
    });

    return praiseItems.flat();
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Quantify praise item by id' })
  @ApiResponse({
    status: 200,
    description: 'Praise items',
    type: [Praise],
  })
  @Permissions(Permission.PraiseQuantify)
  @UseInterceptors(MongooseClassSerializerInterceptor(Praise))
  @ApiParam({ name: 'id', type: 'string' })
  async quantify(
    @Param('id', ObjectIdPipe) praiseId: Types.ObjectId,
    @Body() data: QuantifyInputDto,
    @Request() request: RequestWithAuthContext,
  ): Promise<Praise[]> {
    const userId = new Types.ObjectId(request.authContext?.userId);
    const user = await this.usersService.findOneById(userId);

    if (!userId || !user) {
      throw new ApiException(errorMessages.USER_NOT_FOUND);
    }
    const praise = await this.quantificationsService.quantifyPraise(
      userId,
      praiseId,
      data,
    );

    await this.eventLogService.logEventWithAuthContext({
      authContext: request.authContext,
      typeKey: EventLogTypeKey.USER_ACCOUNT,
      description: `User ${user.username} quantified a Praise ${praiseId} with score ${data.score}`,
    });

    return praise;
  }
}
