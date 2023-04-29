import React from 'react';
import { useDuckDbFiltered } from '../../../model/duckdb/hooks/use-duckbd-filtered.hook';
import { UseDuckDbReturn } from '../../../model/duckdb/types/use-duckdb-return.type';

export const DuckDbContext = React.createContext<UseDuckDbReturn | null>(null);

export function DuckDb({
  children,
  startDate,
  endDate,
}: {
  children: JSX.Element;
  startDate: string;
  endDate: string;
}): JSX.Element | null {
  const duckDb = useDuckDbFiltered({ startDate, endDate });

  return (
    <DuckDbContext.Provider value={duckDb}>{children}</DuckDbContext.Provider>
  );
}
