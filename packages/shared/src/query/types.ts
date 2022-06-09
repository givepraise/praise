export interface QueryInput {
  sortColumn?: string;
  sortType?: string;
  limit?: string;
  page?: string;
}

export interface PaginatedResponseBody<T> {
  totalDocs?: number;
  limit?: number;
  totalPages?: number;
  page?: number;
  pagingCounter?: number;
  hasPrevPage?: Boolean;
  hasNextPage?: Boolean;
  prevPage?: number;
  nextPage?: number;
  hasMore?: Boolean;
  docs: T[];
}
