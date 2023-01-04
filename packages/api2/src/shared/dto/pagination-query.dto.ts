import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString } from 'class-validator';

export class PaginationQuery {
  @ApiProperty({
    example: 10,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  limit: number;

  @ApiProperty({
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  page: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  sortColumn?: string;

  @ApiProperty({ enum: ['asc', 'desc'], default: 'desc', required: false })
  @IsString()
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortType?: string;
}
