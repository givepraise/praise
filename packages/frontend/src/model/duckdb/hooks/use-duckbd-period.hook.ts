import { UseDuckDbReturn } from '../types/use-duckdb-return.type';
import { useDuckDb } from './use-duckbd.hook';

export function useDuckDbPeriod(periodId: string): UseDuckDbReturn {
  const duckDb = useDuckDb({
    usersUrl: 'users/export?format=parquet',
    useraccountsUrl: 'useraccounts/export?format=parquet',
    periodsUrl: 'periods/export?format=parquet',
    praisesUrl: `praise/export?format=parquet&periodId=${periodId}`,
    quantificationsUrl: `quantifications/export?format=parquet&periodId=${periodId}`,
  });
  return duckDb;
}
