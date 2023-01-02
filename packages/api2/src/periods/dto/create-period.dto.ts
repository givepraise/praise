import { PickType } from '@nestjs/swagger';
import { Period } from '../schemas/periods.schema';

export class CreatePeriod extends PickType(Period, ['name'] as const) {
  endDate: string;
}
