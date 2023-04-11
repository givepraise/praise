import 'ses';
import { Parser } from '@json2csv/plainjs';
import { useDuckDbFiltered } from '@/model/duckdb/hooks/use-duckbd-filtered.hook';
import { assertAllTablesLoaded } from '@/model/duckdb/utils/all-tables-loaded.util';
import { AllPeriods } from '@/model/periods/periods';
import { useRecoilValue } from 'recoil';
import { Report } from '../interfaces/report.interface';
import { usePeriodReportInput } from '../types/use-period-report-input.type';
import { UsePeriodReportReturn } from '../types/use-period-report-return.type';
import { usePeriodReportRunInput } from '../types/use-period-report-run-input.type';
import { useCompartment } from './use-compartment.hook';
import { usePeriodReportRunReturn } from '../types/use-period-report-run-return.type';
import { getPeriodDatesConfig } from '../util/get-period-dates-config';
import { ReportManifest } from '../types/report-manifest.type';

//lockdown();

export function usePeriodReport(
  input: usePeriodReportInput
): UsePeriodReportReturn {
  const { url: reportUrl, periodId, startDate, endDate } = input;
  const duckDb = useDuckDbFiltered({ periodId, startDate, endDate });
  const periods = useRecoilValue(AllPeriods);
  const { create: createCompartment } = useCompartment();

  const manifest = async (): Promise<ReportManifest | undefined> => {
    if (!reportUrl) return;
    // Create secure compartment to run report in
    const compartment = createCompartment();

    // Import report from url
    const manifestUrl = `${reportUrl.substring(
      0,
      reportUrl.lastIndexOf('/')
    )}/manifest.js`;
    const { namespace } = await compartment.import(manifestUrl);
    return namespace.default as ReportManifest;
  };

  const run = async (
    input: usePeriodReportRunInput
  ): Promise<usePeriodReportRunReturn | undefined> => {
    if (!reportUrl) return;
    const { format, config: configInput } = input;
    if (!duckDb || !duckDb.db) {
      throw new Error('DuckDb has not be loaded');
    }
    if (!assertAllTablesLoaded(duckDb)) {
      throw new Error('Required database tables have not been loaded');
    }

    // Add period dates to config if available
    const config = {
      ...getPeriodDatesConfig(periods, periodId, startDate, endDate),
      ...(configInput as object),
    };

    // Connect to database
    const conn = await duckDb.db.connect();

    // Create a "mock" db object that can be passed to the report
    // Response is turned into an array of objects for easier use in the report
    const db = {
      query: async (sql: string): Promise<unknown[]> => {
        const t = await conn.query(sql);
        return t.toArray();
      },
    };

    // Create secure compartment to run report in
    const compartment = createCompartment();

    // Import report from url
    const { namespace } = await compartment.import(reportUrl);

    // Create report instance, supplying config and db query object
    const report = new namespace.default(config, db) as Report;

    // Run report, response is an object with result rows and logging info
    let response = await report.run();

    // Add an header and footer message to the log
    let log = `Report: ${report.manifest.name} (${report.manifest.version})\n`;
    log += `Format: ${format}`;
    log += response.log ? `\n${response.log}\n` : '\n\n';
    log += `Number of response rows: ${response.rows?.length}\n\n`;
    log += '🙏';
    response.log = log;

    // Default report format is json but csv is also supported
    let csv: string | undefined;
    if (format === 'csv' && response.rows) {
      const parser = new Parser();
      csv = parser.parse(response.rows);
    }
    if (format === 'json' && response.rows) {
      response = {
        ...response,
        rows: response.rows.map((r) => (r as any).toJSON()),
      };
    }
    return { manifest: report.manifest, ...response, csv };
  };

  return {
    ready: !duckDb.loadingWorker && assertAllTablesLoaded(duckDb),
    run,
    manifest,
    duckDb,
  };
}
