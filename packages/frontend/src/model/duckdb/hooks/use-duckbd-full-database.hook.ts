import { UseDuckDbReturn } from '../types/use-duckdb-return.type';
import { useDuckDb } from './use-duckbd.hook';

export function useDuckDbFullDatabase(): UseDuckDbReturn {
  const duckDb = useDuckDb({
    usersUrl: 'users/export/parquet',
    useraccountsUrl: 'useraccounts/export/parquet',
    periodsUrl: 'periods/export/parquet',
    praisesUrl: 'praise/export/parquet',
    quantificationsUrl: 'quantifications/export/parquet',
  });
  return duckDb;
}
