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
import { PraiseService } from './praise.service';
import { Praise } from './schemas/praise.schema';
import { PraisePaginatedQueryDto } from './dto/praise-paginated-query.dto';
import { PermissionsGuard } from '@/auth/guards/permissions.guard';
import { Permissions } from '@/auth/decorators/permissions.decorator';
import { Permission } from '@/auth/enums/permission.enum';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { QuantifyInputDto } from '@/praise/dto/quantify-input.dto';
import { MongooseClassSerializerInterceptor } from '@/shared/mongoose-class-serializer.interceptor';
import { PraisePaginatedResponseDto } from './dto/praise-paginated-response.dto';
import { Response } from 'express';
import { ExportInputDto } from '@/shared/dto/export-input.dto';
import { allExportsDirPath } from '@/shared/fs.shared';

@Controller('praise')
@ApiTags('Praise')
@SerializeOptions({
  excludePrefixes: ['__'],
})
// @UseGuards(PermissionsGuard)
// @UseGuards(JwtAuthGuard)
export class PraiseController {
  constructor(private readonly praiseService: PraiseService) {}

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
    const { format } = options;
    const exportsRootDirName = `${allExportsDirPath}/praise`;
    const exportDirName = await this.praiseService.getExportDirName();
    const exportId = this.praiseService.getExportId(options);
    const exportFilePath = `${exportsRootDirName}/${exportDirName}/${exportId}/praise.${format}`;

    // Cached export don't exist, clear cache and generate new export
    if (!fs.existsSync(exportFilePath)) {
      if (!fs.existsSync(`${exportsRootDirName}/${exportDirName}`)) {
        fs.rmSync(exportsRootDirName, { recursive: true, force: true });
      }

      console.log("Export file doesn't exist, generating new export files");
      // Generate new export files
      await this.praiseService.generateAllExports(options);
    }

    const file = fs.createReadStream(exportFilePath);
    res.set({
      'Content-Type':
        format === 'json' ? 'application/json' : 'application/octet-stream',
      'Content-Disposition': `attachment; filename="praise.${format}"`,
    });
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
