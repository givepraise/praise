import { PaginatedQueryDto } from '../../shared/dto/pagination-query.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsOptional } from 'class-validator';

export class PraisePaginatedQueryDto extends PaginatedQueryDto {
  @ApiProperty({ required: false, type: 'string' })
  @IsOptional()
  @IsMongoId()
  giver?: string;

  @ApiProperty({ required: false, type: 'string' })
  @IsOptional()
  @IsMongoId()
  receiver?: string;
}
