import { UseDuckDbReturn } from '@/model/duckdb/types/use-duckdb-return.type';
import { useReportRunInput } from './use-report-run-input.type';
import { useReportRunReturn } from './use-report-run-return.type';
import { ReportManifestDto } from '../dto/report-manifest.dto';

export type UseReportReturn = {
  ready: boolean;
  run: (input: useReportRunInput) => Promise<useReportRunReturn | undefined>;
  manifest: () => Promise<ReportManifestDto | undefined>;
  duckDb: UseDuckDbReturn;
};
