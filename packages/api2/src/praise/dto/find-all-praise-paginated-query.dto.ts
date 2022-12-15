import { PaginationQuery } from '@/shared/dto/pagination-query.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class FindAllPraisePaginatedQuery extends PaginationQuery {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  giver?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  receiver?: string;
}
