import { PaginationQuery } from '@/shared/dto/pagination-query.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class FindAllPraisePaginatedQuery extends PaginationQuery {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  giver?: Types.ObjectId;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  receiver?: Types.ObjectId;
}
