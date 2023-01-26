import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString } from 'class-validator';

export class ExportRequestOptions {
  @ApiProperty({
    default: 'csv',
    enum: ['json', 'csv']
  })
  @IsOptional()
  @IsString()
  @Type(() => String)
  format: string;

  @ApiProperty({
    example: '',
  })
  @IsOptional()
  @IsString()
  @Type(() => String)
  startDate: string;

  @ApiProperty({
    example: '',
  })
  @IsOptional()
  @IsString()
  @Type(() => String)
  endDate: string;

  @ApiProperty({
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  periodId: number;
}
