import { PaginationQuery } from '@/shared/dto/pagination-query.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsOptional } from 'class-validator';

export class PraisePaginationQuery extends PaginationQuery {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsMongoId()
  giver?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsMongoId()
  receiver?: string;
}
