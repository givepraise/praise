import { ExportInputDto } from './dto/export-input.dto';
import crypto from 'crypto';

/**
 *  Create a hashed id based on the export options excluding export format
 */
export function exportOptionsHash(options: ExportInputDto): string {
  const { periodId, startDate, endDate } = options;
  return crypto
    .createHash('shake256', { outputLength: 5 })
    .update(JSON.stringify({ periodId, startDate, endDate }))
    .digest('hex');
}

/**
 * Get the return content type based on the export format
 */
export function exportContentType(format: string): string {
  switch (format) {
    case 'parquet':
      return 'application/octet-stream';
    case 'json':
      return 'application/json';
    default:
      return 'text/csv'; // csv
  }
}
