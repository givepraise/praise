import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

export class ExportRequestOptions {
  @ApiProperty({
    default: 'csv',
  })
  @IsOptional()
  @IsString()
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
