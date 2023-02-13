import * as arrow from 'apache-arrow';
import { UseDuckDbReturn } from '@/model/duckdb/types/use-duckdb-return.type';
import { usePeriodReportRunInput } from './use-period-report-run-input.type';

export type UsePeriodReportReturn = {
  run: (input: usePeriodReportRunInput) => Promise<string | arrow.Table>;
  duckDb: UseDuckDbReturn;
};
