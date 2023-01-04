import { ApiResponseProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PaginationModel } from '@/shared/dto/pagination-model.dto';
import { Period } from '../schemas/periods.schema';

export class PeriodPaginationModelDto extends PaginationModel {
  @ApiResponseProperty({
    type: [Period],
  })
  @Type(() => Period)
  docs: Period[];
}
