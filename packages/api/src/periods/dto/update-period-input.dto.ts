import { ApiProperty, PartialType, PickType } from '@nestjs/swagger';
import { Period } from '../schemas/periods.schema';
import { IsDateString, IsOptional } from 'class-validator';

export class UpdatePeriodInputDto extends PartialType(
  PickType(Period, ['name', 'attestationsTxHash'] as const),
) {
  @ApiProperty({ type: 'string', required: false })
  @IsDateString()
  @IsOptional()
  endDate?: string;
}
