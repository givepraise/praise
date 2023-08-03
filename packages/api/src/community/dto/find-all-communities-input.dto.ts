import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { PaginatedQueryDto } from '../../shared/dto/pagination-query.dto';

export class FindAllCommunitiesInputDto extends PaginatedQueryDto {
  @ApiProperty({
    required: false,
    type: 'string',
    example: 'hostname.givepraise.xyz',
  })
  @IsOptional()
  hostname?: string;
}
