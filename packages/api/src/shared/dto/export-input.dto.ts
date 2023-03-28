import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDate, IsEnum, IsOptional } from 'class-validator';
import { Types } from 'mongoose';
import { IsObjectId } from '../../shared/validators/is-object-id.validator';
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
  @IsOptional()
  @IsDate()
  @Transform(({ value }) => parseISO(value))
  startDate?: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDate()
  @Transform(({ value }) => parseISO(value))
  endDate?: Date;

  @ApiProperty({ required: false, type: 'string' })
  @IsOptional()
  @IsObjectId()
  @Transform(({ value }) =>
    Types.ObjectId.isValid(value) ? new Types.ObjectId(value) : value,
  )
  periodId?: Types.ObjectId;
}
