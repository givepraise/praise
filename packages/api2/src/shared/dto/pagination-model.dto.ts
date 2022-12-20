import { ApiProperty } from '@nestjs/swagger';

export class PaginationModel<T> {
  @ApiProperty()
  totalDocs: number | undefined;
  @ApiProperty()
  limit: number | undefined;
  @ApiProperty()
  totalPages: number | undefined;
  @ApiProperty()
  page: number | undefined;
  @ApiProperty()
  pagingCounter: number | undefined;
  @ApiProperty()
  hasPrevPage: Boolean | undefined;
  @ApiProperty()
  hasNextPage: Boolean | undefined;
  @ApiProperty()
  prevPage: number | undefined;
  @ApiProperty()
  nextPage: number | undefined;
  @ApiProperty()
  docs: T[];
}
