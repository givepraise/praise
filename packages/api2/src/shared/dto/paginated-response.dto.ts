import { ApiResponseProperty } from '@nestjs/swagger';

export class PaginatedResponseDto {
  @ApiResponseProperty({
    example: 1200,
  })
  totalDocs: number | undefined;

  @ApiResponseProperty({
    example: 10,
  })
  limit: number | undefined;

  @ApiResponseProperty({
    example: 12,
  })
  totalPages: number | undefined;

  @ApiResponseProperty({
    example: 2,
  })
  page: number | undefined;

  @ApiResponseProperty({
    example: 1,
  })
  pagingCounter: number | undefined;

  @ApiResponseProperty({
    example: false,
  })
  // eslint-disable-next-line @typescript-eslint/ban-types
  hasPrevPage: Boolean | undefined;

  @ApiResponseProperty({
    example: true,
  })
  // eslint-disable-next-line @typescript-eslint/ban-types
  hasNextPage: Boolean | undefined;

  @ApiResponseProperty({
    example: 1,
  })
  prevPage: number | undefined;

  @ApiResponseProperty({
    example: 3,
  })
  nextPage: number | undefined;
}
