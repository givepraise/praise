import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString, IsIn } from 'class-validator';

export class ExportPeriodsInputDto {
  @ApiProperty({
    enum: ['csv', 'parquet'],
    default: 'csv',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsIn(['csv', 'parquet'])
  @Type(() => String)
  format?: string;
}
