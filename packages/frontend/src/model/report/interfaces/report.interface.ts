import { ReportManifest } from '../types/report-manifest.type';

export interface Report {
  manifest: ReportManifest;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  run(): Promise<{ rows: unknown[]; log: string }>;
}
