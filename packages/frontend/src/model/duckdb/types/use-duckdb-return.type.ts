import * as duckdb from '@duckdb/duckdb-wasm';
import { TablesCreated } from '../types/tables-created.type';

export type UseDuckDbReturn = {
  db: duckdb.AsyncDuckDB | undefined;
  loadingWorker: boolean;
  tables: TablesCreated;
};
