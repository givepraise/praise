import { Praise } from '@/praise/schemas/praise.schema';
import { PeriodDetailsDto } from './period-details.dto';

export class ReplaceQuantifierResponseDto {
  period: PeriodDetailsDto;
  praises: Praise[];
}
