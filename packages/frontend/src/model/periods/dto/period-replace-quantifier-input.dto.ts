import { PraiseDto } from '@/model/praise/praise.dto';
import { PeriodDetailsDto } from './period-details.dto';

export interface PeriodReplaceQuantifierInputDto {
  period: PeriodDetailsDto;
  praises: PraiseDto[];
}
