import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { SortType } from '../enums/sort-type.enum';

export class PaginatedQueryDto {
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

  @ApiProperty({ enum: SortType, default: SortType.desc, required: false })
  @IsOptional()
  @IsEnum(SortType)
  sortType?: string;
}
