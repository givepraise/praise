import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class PaginationQuery {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  limit?: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  page?: number;

  @ApiProperty()
  @IsString()
  sortColumn: string;

  @ApiProperty()
  @IsString()
  sortType: string;
}
