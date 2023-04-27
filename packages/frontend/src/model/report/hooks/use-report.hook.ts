import 'ses';
import { Parser } from '@json2csv/plainjs';
import { useDuckDbFiltered } from '@/model/duckdb/hooks/use-duckbd-filtered.hook';
import { assertAllTablesLoaded } from '@/model/duckdb/utils/all-tables-loaded.util';
import { AllPeriods } from '@/model/periods/periods';
import { useRecoilValue } from 'recoil';
import { Report } from '../interfaces/report.interface';
import { useReportInput } from '../types/use-report-input.type';
import { UseReportReturn } from '../types/use-report-return.type';
import { useReportRunInput } from '../types/use-report-run-input.type';
import { useCompartment } from './use-compartment.hook';
import { useReportRunReturn } from '../types/use-report-run-return.type';
import { getPeriodDatesConfig } from '../util/get-period-dates-config';
import { ReportManifestDto } from '../dto/report-manifest.dto';

//lockdown();

export function useReport(input: useReportInput): UseReportReturn {
  const { url: reportUrl, periodId, startDate, endDate } = input;
  const duckDb = useDuckDbFiltered({ periodId, startDate, endDate });
  const periods = useRecoilValue(AllPeriods);
  const { create: createCompartment } = useCompartment();

  const manifest = async (): Promise<ReportManifestDto | undefined> => {
    if (!reportUrl) return;
    // Create secure compartment to run report in
    const compartment = createCompartment();

    // Import report from url
    const manifestUrl = `${reportUrl.substring(
      0,
      reportUrl.lastIndexOf('/')
    )}/manifest.json`;
    const { namespace } = await compartment.import(manifestUrl);
    return namespace.default as ReportManifestDto;
  };

  const run = async (
    input: useReportRunInput
  ): Promise<useReportRunReturn | undefined> => {
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
    let log = '✅ Report run completed.\n';
    if (response.rows?.length) {
      log += `Response rows: ${response.rows?.length}\n\n`;
    } else {
      log += 'Report did not return any result\n\n';
    }
    log += response.log ? `${response.log}\n` : 'No log items.\n';
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
