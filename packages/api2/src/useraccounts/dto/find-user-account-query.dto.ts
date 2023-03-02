import { IsObjectId } from '@/shared/validators.shared';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class FindUserAccountQueryDto {
  @ApiProperty({ required: false, type: 'string' })
  @IsOptional()
  @IsObjectId()
  @Type(() => Types.ObjectId)
  _id?: Types.ObjectId;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  accountId?: string;
}
