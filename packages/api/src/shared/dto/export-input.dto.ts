import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDate, IsEnum, IsOptional } from 'class-validator';
import parseISO from 'date-fns/parseISO';
import { ExportFormat } from '../enums/export-format.enum';

export class ExportInputDto {
  @ApiProperty({
    enum: ExportFormat,
    default: ExportFormat.CSV,
    required: false,
  })
  @IsOptional()
  @IsEnum(ExportFormat)
  format?: ExportFormat;

  @ApiProperty({ required: false })
  @IsDate()
  @Transform(({ value }) => parseISO(value))
  startDate: Date;

  @ApiProperty({ required: false })
  @IsDate()
  @Transform(({ value }) => parseISO(value))
  endDate: Date;
}
