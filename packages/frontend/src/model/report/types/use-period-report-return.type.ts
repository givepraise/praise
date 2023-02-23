import { UseDuckDbReturn } from '@/model/duckdb/types/use-duckdb-return.type';
import { usePeriodReportRunInput } from './use-period-report-run-input.type';
import { usePeriodReportRunReturn } from './use-period-report-run-return.type';
import { ReportManifest } from './report-manifest.type';

export type UsePeriodReportReturn = {
  run: (input: usePeriodReportRunInput) => Promise<usePeriodReportRunReturn>;
  manifest: () => Promise<ReportManifest>;
  duckDb: UseDuckDbReturn;
};
