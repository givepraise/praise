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
      return `&startDate=${encodeURIComponent(
        filter.startDate
      )}&endDate=${encodeURIComponent(filter.endDate)}`;
    }
    return '';
  };

  const duckDb = useDuckDb({
    usersUrl: 'users/export/parquet',
    useraccountsUrl: 'useraccounts/export/parquet',
    periodsUrl: 'periods/export/parquet',
    praisesUrl: `praise/export/parquet${filterQueryString()}`,
    quantificationsUrl: `quantifications/export/parquet${filterQueryString()}`,
  });
  return duckDb;
}
