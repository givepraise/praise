import { ApiResponseProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PaginatedResponseDto } from '@/shared/dto/paginated-response.dto';
import { Period } from '../schemas/periods.schema';

export class PeriodPaginatedResponseDto extends PaginatedResponseDto {
  @ApiResponseProperty({
    type: [Period],
  })
  @Type(() => Period)
  docs: Period[];
}
