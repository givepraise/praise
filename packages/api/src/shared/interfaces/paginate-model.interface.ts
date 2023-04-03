import { Model, PaginateResult } from 'mongoose';

export interface PaginateModel<T> extends Model<T> {
  paginate: (
    query?: any,
    options?: any,
    callback?: (err: any, result: PaginateResult<T>) => void,
  ) => Promise<PaginateResult<T>>;
}
