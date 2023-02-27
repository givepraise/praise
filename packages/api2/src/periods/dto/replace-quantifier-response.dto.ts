import { Praise } from '@/praise/schemas/praise.schema';
import { ApiResponseProperty } from '@nestjs/swagger';
import { PeriodDetailsDto } from './period-details.dto';

export class ReplaceQuantifierResponseDto {
  @ApiResponseProperty({
    type: [Praise],
  })
  praises: Praise[];

  @ApiResponseProperty({ type: PeriodDetailsDto })
  period: PeriodDetailsDto;
}
