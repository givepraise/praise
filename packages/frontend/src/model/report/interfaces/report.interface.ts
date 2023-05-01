import { ReportManifestDto } from '../dto/report-manifest.dto';
import { row } from './report-row.interface';

export interface Report {
  manifest: ReportManifestDto;
  run(): Promise<{ rows: row[]; log: string }>;
}
