import { ApiProperty } from '@nestjs/swagger';
import { PaginatedQueryDto } from '../../shared/dto/pagination-query.dto';
import { IsOptional } from 'class-validator';

export class CommunityFindAllQueryDto extends PaginatedQueryDto {
  @ApiProperty({
    required: false,
    type: 'string',
    example: 'hostname.givepraise.xyz',
  })
  @IsOptional()
  hostname?: string;
}
