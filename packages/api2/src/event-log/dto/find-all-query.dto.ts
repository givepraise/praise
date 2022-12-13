import { PaginationQuery } from '@/shared/dto/pagination-query.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class FindAllQuery extends PaginationQuery {
  @ApiProperty()
  @IsString()
  search: string;

  @ApiProperty()
  @IsString()
  type: string;
}
