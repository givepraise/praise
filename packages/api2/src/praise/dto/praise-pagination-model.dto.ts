import { ApiResponseProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Praise } from '../schemas/praise.schema';
import { PaginationModel } from '@/shared/dto/pagination-model.dto';

export class PraisePaginationModelDto extends PaginationModel {
  @ApiResponseProperty({
    type: [Praise],
  })
  @Type(() => Praise)
  docs: Praise[];
}
