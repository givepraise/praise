import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsDate, IsIn, IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';
import { IsObjectId } from '@/shared/validators/is-object-id.validator';
import parseISO from 'date-fns/parseISO';

export class ExportInputDto {
  @ApiProperty({
    enum: ['csv', 'json', 'parquet'],
    default: 'csv',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsIn(['csv', 'json', 'parquet'])
  @Type(() => String)
  format?: string;

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
