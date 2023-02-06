import { ExportInputDto } from './dto/export-input.dto';
import crypto from 'crypto';

/**
 *  Create a hashed id based on the export options excluding export format
 */
export function optionsHash(options: ExportInputDto): string {
  const { periodId, startDate, endDate } = options;
  return crypto
    .createHash('shake256', { outputLength: 5 })
    .update(JSON.stringify({ periodId, startDate, endDate }))
    .digest('hex');
}
