import { useDuckDbFilteredInput } from '../types/use-duckdb-filtered-input.type';
import { UseDuckDbReturn } from '../types/use-duckdb-return.type';
import { useDuckDb } from './use-duckbd.hook';

export function useDuckDbFiltered(
  filter: useDuckDbFilteredInput
): UseDuckDbReturn {
  const filterQueryString = (): string => {
    if (filter.periodId) {
      return `&periodId=${filter.periodId}`;
    }
    if (filter.startDate && filter.endDate) {
      return `&startDate=${filter.startDate}&endDate=${filter.endDate}`;
    }
    return '';
  };

  const duckDb = useDuckDb({
    usersUrl: 'users/export?format=parquet',
    useraccountsUrl: 'useraccounts/export?format=parquet',
    periodsUrl: 'periods/export?format=parquet',
    praisesUrl: `praise/export?format=parquet${filterQueryString()}`,
    quantificationsUrl: `quantifications/export?format=parquet${filterQueryString()}`,
  });
  return duckDb;
}
