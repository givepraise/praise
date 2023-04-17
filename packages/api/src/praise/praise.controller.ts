import * as fs from 'fs';
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  Request,
  Res,
  SerializeOptions,
  StreamableFile,
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
import { Praise } from './schemas/praise.schema';
import { PraisePaginatedQueryDto } from './dto/praise-paginated-query.dto';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { Permission } from '../auth/enums/permission.enum';
import { MongooseClassSerializerInterceptor } from '../shared/interceptors/mongoose-class-serializer.interceptor';
import { PraisePaginatedResponseDto } from './dto/praise-paginated-response.dto';
import { Response } from 'express';
import { ExportInputDto } from '../shared/dto/export-input.dto';
import { allExportsDirPath } from '../shared/fs.shared';
import { exportContentType, exportOptionsHash } from '../shared/export.shared';
import { PraiseExportService } from './services/praise-export.service';
import { EnforceAuthAndPermissions } from '../auth/decorators/enforce-auth-and-permissions.decorator';
import { PraiseCreateInputDto } from './dto/praise-create-input.dto';
import { PraiseForwardInputDto } from './dto/praise-forward-input.dto';
import { EventLogService } from 'src/event-log/event-log.service';
import { RequestWithAuthContext } from 'src/auth/interfaces/request-with-auth-context.interface';
import { EventLogTypeKey } from 'src/event-log/enums/event-log-type-key';

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

  @Get('export')
  @ApiOperation({ summary: 'Export Praises document to json or csv' })
  @ApiOkResponse({
    schema: {
      type: 'string',
      format: 'binary',
    },
  })
  @ApiProduces('application/octet-stream')
  @ApiProduces('application/json')
  @Permissions(Permission.PraiseExport)
  async export(
    @Query() options: ExportInputDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const format = options.format || 'csv';

    // Root path for all exports
    const rootPath = `${allExportsDirPath}/praise`;

    // Directory level 1 is the latest praise id
    const dirLevel1 = (await this.praiseService.findLatest())._id.toString();

    // Directory level 2 is the hashed options
    const dirLevel2 = exportOptionsHash(options);

    const dirPath = `${rootPath}/${dirLevel1}/${dirLevel2}`;
    const filePath = `${dirPath}/praise.${format}`;

    if (!fs.existsSync(filePath)) {
      // If cached export don't exist
      if (!fs.existsSync(`${rootPath}/${dirLevel1}`)) {
        // If the latest praise id folder doesn't exist,
        // database hase been updated, clear all cached exports
        fs.rmSync(rootPath, { recursive: true, force: true });
      }

      // Create directory for new export
      fs.mkdirSync(dirPath, { recursive: true });

      // Generate new export files
      await this.praiseExportService.generateAllExports(dirPath, options);
    }

    res.set({
      'Content-Type': exportContentType(format),
      'Content-Disposition': `attachment; filename="praise.${format}"`,
    });

    const file = fs.createReadStream(filePath);
    return new StreamableFile(file);
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
    const praiseItem = this.praiseService.createPraiseItem(data);

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
    const praiseItem = this.praiseService.createPraiseItem(data);

    await this.eventLogService.logEventWithAuthContext({
      authContext: request.authContext,
      typeKey: EventLogTypeKey.PRAISE,
      description: `Forwarder ${data.forwarder} created an Praise item with receiver IDS ${data.receiverIds}`,
    });

    return praiseItem;
  }
}
