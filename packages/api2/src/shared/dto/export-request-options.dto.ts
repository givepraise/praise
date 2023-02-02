import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsOptional, IsString } from 'class-validator';

export class ExportRequestOptions {
  @ApiProperty({
    enum: ['csv', 'json'],
    default: 'csv',
    required: false
  })
  @IsOptional()
  @IsString()
  @IsIn(['csv', 'json'])
  @Type(() => String)
  format: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @Type(() => String)
  startDate: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @Type(() => String)
  endDate: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @Type(() => String)
  periodId: string;
}
