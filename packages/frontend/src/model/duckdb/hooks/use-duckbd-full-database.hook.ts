import { DuckDbReturn, useDuckDb } from './use-duckbd.hook';

export function useDuckDbFullDatabase(): DuckDbReturn {
  const duckDb = useDuckDb({
    users: 'users/export?format=parquet',
    userAccounts: 'useraccounts/export?format=parquet',
    periods: 'periods/export?format=parquet',
    praise: 'praise/export?format=parquet',
    quantifications: 'quantifications/export?format=parquet',
  });
  return duckDb;
}
