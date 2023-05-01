import { ReportManifestDto } from '../dto/report-manifest.dto';
import { row } from '../interfaces/report-row.interface';

export type useReportRunReturn = {
  manifest: ReportManifestDto;
  rows: row[];
  csv?: string;
  log: string;
};
