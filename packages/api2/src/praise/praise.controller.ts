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
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
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
import { ExportRequestOptions } from '@/shared/dto/export-request-options.dto';

@Controller('praise')
@ApiTags('Praise')
@SerializeOptions({
  excludePrefixes: ['__'],
})
@UseInterceptors(MongooseClassSerializerInterceptor(Praise))
@UseGuards(PermissionsGuard)
@UseGuards(JwtAuthGuard)
export class PraiseController {
  constructor(private readonly praiseService: PraiseService) {}

  @Get()
  @ApiOperation({ summary: 'List praise items, paginated results' })
  @ApiResponse({
    status: 200,
    description: 'Paginated praise items',
    type: PraisePaginatedResponseDto,
  })
  @Permissions(Permission.PraiseView)
  async findAllPaginated(
    @Query() options: PraisePaginatedQueryDto,
  ): Promise<PraisePaginatedResponseDto> {
    return this.praiseService.findAllPaginated(options);
  }

  @Get('export')
  @ApiOperation({ summary: 'Export Praises document to json or csv' })
  @ApiResponse({
    status: 200,
    description: 'Praise Export',
    type: [Praise],
  })
  @Permissions(Permission.UsersExport)
  @ApiParam({ name: 'format', type: String })
  @ApiParam({ name: 'startDate', type: String })
  @ApiParam({ name: 'endDate', type: String })
  @ApiParam({ name: 'periodId', type: String })
  async export(
    @Query() options: ExportRequestOptions,
    @Res({ passthrough: true }) res: Response,
  ): Promise<Praise[] | undefined> {
    const praises = await this.praiseService.export(
      options.format,
      options.startDate,
      options.endDate,
      options.periodId
    );

    if (options.format === 'json') return praises as Praise[];

    res.set({
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="users.csv"',
    });
    res.send(praises);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find praise item by id' })
  @ApiResponse({
    status: 200,
    description: 'Praise item',
    type: Praise,
  })
  @Permissions(Permission.PraiseView)
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
