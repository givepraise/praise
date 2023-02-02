import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';
import { ObjectIdPipe } from '../pipes/object-id.pipe';

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

  @ApiProperty({
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @Type(() => ObjectIdPipe)
  periodId: Types.ObjectId;
}
