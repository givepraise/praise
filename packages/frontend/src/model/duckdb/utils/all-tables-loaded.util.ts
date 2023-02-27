import { UseDuckDbReturn } from '../types/use-duckdb-return.type';

export function assertAllTablesLoaded(duckDb: UseDuckDbReturn): boolean {
  return (
    duckDb.tables.users &&
    duckDb.tables.useraccounts &&
    duckDb.tables.periods &&
    duckDb.tables.praises &&
    duckDb.tables.quantifications
  );
}
