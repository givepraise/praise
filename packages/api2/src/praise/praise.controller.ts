import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  Post,
  Query,
  SerializeOptions,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { isArray } from 'class-validator';
import { Model, Types } from 'mongoose';
import { ObjectIdPipe } from '@/shared/pipes/object-id.pipe';
import { PraiseQuantifyMultiplePraiseInput } from './intefaces/praise-quantify-multiple-input.interface';
import { PraiseService } from './praise.service';
import { Praise } from './schemas/praise.schema';
import { FindAllPraisePaginatedQuery } from './dto/find-all-praise-paginated-query.dto';
import { PaginationModel } from '@/shared/dto/pagination-model.dto';
import { PermissionsGuard } from '@/auth/guards/permissions.guard';
import { Permissions } from '@/auth/decorators/permissions.decorator';
import { Permission } from '@/auth/enums/permission.enum';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { CreateUpdateQuantificationRequest } from '@/quantifications/dto/create-update-quantification-request.dto';

@Controller('praise')
@SerializeOptions({
  excludePrefixes: ['__'],
  groups: ['praise'],
})
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(PermissionsGuard)
@UseGuards(JwtAuthGuard)
export class PraiseController {
  constructor(private readonly praiseService: PraiseService) {}

  @Get()
  @ApiOperation({ summary: 'List praise items, paginated results' })
  @ApiResponse({
    status: 200,
    description: 'Paginated praise items',
    type: PaginationModel<Praise>,
  })
  @Permissions(Permission.PraiseView)
  async findAllPaginated(
    @Query() options: FindAllPraisePaginatedQuery,
  ): Promise<PaginationModel<Praise>> {
    return this.praiseService.findAllPaginated(options);
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

  @Post(':id/quantify')
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
    @Body() data: CreateUpdateQuantificationRequest,
  ): Promise<Praise[]> {
    return this.praiseService.quantifyPraise({
      id: id.toString(),
      bodyParams: data,
    });
  }

  @Post('quantify')
  @ApiOperation({ summary: 'Quantify multiple praise items' })
  @ApiResponse({
    status: 200,
    description: 'Praise items',
    type: [Praise],
  })
  @Permissions(Permission.PraiseQuantify)
  async quantifyMultiple(
    @Body() data: PraiseQuantifyMultiplePraiseInput,
  ): Promise<Praise[]> {
    const { praiseIds } = data;

    if (!isArray(praiseIds)) {
      throw new BadRequestException('praiseIds must be an array');
    }

    const praiseItems = await Promise.all(
      praiseIds.map(async (id) => {
        const affectedPraises = await this.praiseService.quantifyPraise({
          id,
          bodyParams: data,
        });

        return affectedPraises;
      }),
    );

    return praiseItems.flat();
  }
}
