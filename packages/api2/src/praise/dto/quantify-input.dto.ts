import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class QuantifyInputDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  score?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  dismissed?: boolean;

  @ApiProperty({ required: false, example: '639b178f19296ee0f2d0585d' })
  @IsOptional()
  @IsString()
  duplicatePraiseId?: Types.ObjectId;
}
