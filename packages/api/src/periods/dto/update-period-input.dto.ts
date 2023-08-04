import { ApiProperty, PartialType, PickType } from '@nestjs/swagger';
import { Period } from '../schemas/periods.schema';
import { IsDateString } from 'class-validator';

export class UpdatePeriodInputDto extends PartialType(
  PickType(Period, ['name', 'attestationsTxHash'] as const),
) {
  @ApiProperty({ type: 'string', required: false })
  @IsDateString()
  endDate?: string;
}
