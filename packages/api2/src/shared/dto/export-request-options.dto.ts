import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsDate, IsIn, IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';
import { IsObjectId } from '../validators.shared';

export class ExportRequestOptions {
  @ApiProperty({
    enum: ['csv', 'json'],
    default: 'csv',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsIn(['csv', 'json'])
  @Type(() => String)
  format: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDate()
  @Transform(({ value }) => new Date(value))
  startDate?: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDate()
  @Transform(({ value }) => new Date(value))
  endDate?: Date;

  @ApiProperty({ required: false, type: String })
  @IsOptional()
  @IsObjectId()
  @Transform(({ value }) =>
    Types.ObjectId.isValid(value) ? new Types.ObjectId(value) : value,
  )
  periodId?: Types.ObjectId;
}
