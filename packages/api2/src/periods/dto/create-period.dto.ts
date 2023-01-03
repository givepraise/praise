import { PickType } from '@nestjs/swagger';
import { Period } from '../schemas/periods.schema';
import { IsDateString } from 'class-validator';

export class CreatePeriod extends PickType(Period, ['name'] as const) {
  @IsDateString()
  endDate: string;
}
