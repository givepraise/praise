import { Praise } from '@/praise/schemas/praise.schema';
import { PeriodDetailsDto } from './period-details.dto';

export interface PeriodReplaceQuantifierResponseDto {
  period: PeriodDetailsDto;
  praises: Praise[];
}
