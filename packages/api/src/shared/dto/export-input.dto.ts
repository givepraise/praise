import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDate } from 'class-validator';
import parseISO from 'date-fns/parseISO';

export class ExportInputDto {
  @ApiProperty({ required: false })
  @IsDate()
  @Transform(({ value }) => parseISO(value))
  startDate: Date;

  @ApiProperty({ required: false })
  @IsDate()
  @Transform(({ value }) => parseISO(value))
  endDate: Date;
}
