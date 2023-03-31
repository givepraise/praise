import { PaginateResult } from 'mongoose';

export function implementsPagination(obj: any): obj is PaginateResult<any> {
  return 'docs' in obj;
}
