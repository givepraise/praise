import { ApiProperty, PickType } from '@nestjs/swagger';
import { Period } from '../schemas/periods.schema';
import { IsDateString } from 'class-validator';

export class CreatePeriodInputDto extends PickType(Period, ['name'] as const) {
  @ApiProperty()
  @IsDateString()
  endDate: string;
}
