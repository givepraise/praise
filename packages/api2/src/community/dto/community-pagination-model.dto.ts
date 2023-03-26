import { ApiResponseProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PaginatedResponseDto } from '../../shared/dto/paginated-response.dto';
import { Community } from '../schemas/community.schema';

export class CommunityPaginatedResponseDto extends PaginatedResponseDto {
  @ApiResponseProperty({
    type: [Community],
  })
  @Type(() => Community)
  docs: Community[];
}
