import { UseDuckDbReturn } from '../types/use-duckdb-return.type';
import { useDuckDb } from './use-duckbd.hook';

export function useDuckDbFullDatabase(): UseDuckDbReturn {
  const duckDb = useDuckDb({
    usersUrl: 'users/export?format=parquet',
    useraccountsUrl: 'useraccounts/export?format=parquet',
    periodsUrl: 'periods/export?format=parquet',
    praisesUrl: 'praise/export?format=parquet',
    quantificationsUrl: 'quantifications/export?format=parquet',
  });
  return duckDb;
}
