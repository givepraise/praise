import * as fs from 'fs';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Res,
  SerializeOptions,
  StreamableFile,
  UseGuards,
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
import { isArray } from 'class-validator';
import { Types } from 'mongoose';
import { ObjectIdPipe } from '@/shared/pipes/object-id.pipe';
import { QuantifyMultipleInputDto } from './dto/quantify-multiple-input.dto';
import { PraiseService } from './services/praise.service';
import { Praise } from './schemas/praise.schema';
import { PraisePaginatedQueryDto } from './dto/praise-paginated-query.dto';
import { PermissionsGuard } from '@/auth/guards/permissions.guard';
import { Permissions } from '@/auth/decorators/permissions.decorator';
import { Permission } from '@/auth/enums/permission.enum';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { QuantifyInputDto } from '@/praise/dto/quantify-input.dto';
import { MongooseClassSerializerInterceptor } from '@/shared/interceptors/mongoose-class-serializer.interceptor';
import { PraisePaginatedResponseDto } from './dto/praise-paginated-response.dto';
import { Response } from 'express';
import { ExportInputDto } from '@/shared/dto/export-input.dto';
import { allExportsDirPath } from '@/shared/fs.shared';
import { exportContentType, exportOptionsHash } from '@/shared/export.shared';
import { PraiseExportService } from './services/praise-export.service';

@Controller('praise')
@ApiTags('Praise')
@SerializeOptions({
  excludePrefixes: ['__'],
})
// @UseGuards(PermissionsGuard)
// @UseGuards(JwtAuthGuard)
export class PraiseController {
  constructor(
    private readonly praiseService: PraiseService,
    private readonly praiseExportService: PraiseExportService,
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
  @Permissions(Permission.UsersExport)
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
  @ApiParam({ name: 'id', type: String })
  async findOne(
    @Param('id', ObjectIdPipe) id: Types.ObjectId,
  ): Promise<Praise> {
    return this.praiseService.findOneById(id);
  }

  @Patch(':id/quantify')
  @ApiOperation({ summary: 'Quantify praise item by id' })
  @ApiResponse({
    status: 200,
    description: 'Praise items',
    type: [Praise],
  })
  @Permissions(Permission.PraiseQuantify)
  @UseInterceptors(MongooseClassSerializerInterceptor(Praise))
  @ApiParam({ name: 'id', type: String })
  async quantify(
    @Param('id', ObjectIdPipe) id: Types.ObjectId,
    @Body() data: QuantifyInputDto,
  ): Promise<Praise[]> {
    return this.praiseService.quantifyPraise(id, data);
  }

  @Patch('quantify')
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
  ): Promise<Praise[]> {
    const { praiseIds, params } = data;

    if (!isArray(praiseIds)) {
      throw new BadRequestException('praiseIds must be an array');
    }

    const praiseItems = await Promise.all(
      praiseIds.map(async (id) => {
        const affectedPraises = await this.praiseService.quantifyPraise(
          id,
          params,
        );

        return affectedPraises;
      }),
    );

    return praiseItems.flat();
  }
}
