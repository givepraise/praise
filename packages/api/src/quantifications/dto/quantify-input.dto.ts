import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class QuantifyInputDto {
  @ApiProperty({ required: false, type: 'number' })
  @IsOptional()
  @IsNumber()
  score?: number;

  @ApiProperty({ required: false, type: 'boolean' })
  @IsOptional()
  @IsBoolean()
  dismissed?: boolean;

  @ApiProperty({
    required: false,
    example: '639b178f19296ee0f2d0585d',
    type: 'string',
  })
  @IsOptional()
  @IsString()
  duplicatePraise?: Types.ObjectId;
}
