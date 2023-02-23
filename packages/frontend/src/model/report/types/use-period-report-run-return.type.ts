import { ReportManifest } from './report-manifest.type';

export type usePeriodReportRunReturn = {
  manifest: ReportManifest;
  rows: unknown[];
  csv?: string;
  log: string;
};
