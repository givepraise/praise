import { AsyncDuckDBConnection } from '@duckdb/duckdb-wasm';
import { ReportManifest } from '../types/report-manifest.type';

export interface Report {
  manifest(): ReportManifest;
  validateConfig(config: Object): boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  run(config: Object, db: AsyncDuckDBConnection): Promise<any>;
}
