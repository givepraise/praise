import { ApiResponseProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Praise } from '../schemas/praise.schema';
import { PaginatedResponseDto } from '@/shared/dto/paginated-response.dto';

export class PraisePaginatedResponseDto extends PaginatedResponseDto {
  @ApiResponseProperty({
    type: [Praise],
  })
  @Type(() => Praise)
  docs: Praise[];
}
