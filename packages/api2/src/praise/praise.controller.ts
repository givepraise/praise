import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { PaginatedResponseBody } from '@/shared/types.shared';
import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  Req,
  SerializeOptions,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiParam } from '@nestjs/swagger';
import { Request } from 'express';
import { Types } from 'mongoose';
import { ObjectIdPipe } from 'src/objectId.pipe';
import { PraiseDetailsDto } from './dto/praise-details.dto';
import { PraiseService } from './praise.service';
import { Praise } from './schemas/praise.schema';

@Controller('praise')
@SerializeOptions({
  excludePrefixes: ['__'],
})
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(JwtAuthGuard)
export class PraiseController {
  constructor(private readonly praiseService: PraiseService) {}

  @Get()
  async findAll(
    @Req() req: Request,
  ): Promise<PaginatedResponseBody<PraiseDetailsDto>> {
    return this.praiseService.findAll(req);
  }

  @Get(':id')
  @ApiParam({ name: 'id', type: String })
  async findOne(
    @Param('id', ObjectIdPipe) id: Types.ObjectId,
  ): Promise<Praise> {
    return this.praiseService.findOneById(id);
  }
}
