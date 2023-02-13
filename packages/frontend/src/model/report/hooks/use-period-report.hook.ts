import 'ses';
import * as arrow from 'apache-arrow';
import { Parser } from '@json2csv/plainjs';
import { ExternalGet } from '@/model/axios';
import { useDuckDbFiltered } from '@/model/duckdb/hooks/use-duckbd-filtered.hook';
import { assertAllTablesLoaded } from '@/model/duckdb/utils/all-tables-loaded.util';
import { AllPeriods } from '@/model/periods/periods';
import { getPreviousPeriod } from '@/utils/periods';
import { useRecoilValue } from 'recoil';
import { Report } from '../interfaces/report.interface';
import { usePeriodReportInput } from '../types/use-period-report-input.type';
import { UsePeriodReportReturn } from '../types/use-period-report-return.type';
import { usePeriodReportRunInput } from '../types/use-period-report-run-input.type';

//lockdown();

export function usePeriodReport(
  input: usePeriodReportInput
): UsePeriodReportReturn {
  const {
    url: reportSrcUrl,
    config: configInput,
    periodId,
    startDate,
    endDate,
  } = input;
  const duckDb = useDuckDbFiltered({ periodId, startDate, endDate });
  const reportSrcResponse = useRecoilValue(ExternalGet({ url: reportSrcUrl }));
  const periods = useRecoilValue(AllPeriods);

  const createReport = (src: string): Report => {
    const compartment = new Compartment({
      Math,
      print: console.log,
    });
    return compartment.evaluate(src)();
  };

  const getPeriodDatesConfig = ():
    | { startDate: string; endDate: string }
    | undefined => {
    if (periodId) {
      if (!periods) {
        throw new Error('Periods could not be loaded');
      }
      const period = periods.find((p) => p._id === periodId);
      if (!period) {
        throw new Error('Period not found');
      }
      const previousPeriod = getPreviousPeriod(periods, period);
      if (!previousPeriod) {
        throw new Error('Previous period not found');
      }
      return {
        startDate: previousPeriod.endDate,
        endDate: period.endDate,
      };
    }
    if (startDate && endDate) {
      return {
        startDate,
        endDate,
      };
    }
    return undefined;
  };

  const run = async (
    input: usePeriodReportRunInput
  ): Promise<string | arrow.Table> => {
    const { format } = input;
    if (!duckDb || !duckDb.db) {
      throw new Error('DuckDb has not be loaded');
    }
    if (!reportSrcResponse || reportSrcResponse.status !== 200) {
      throw new Error('Report source could not be loaded');
    }
    if (!assertAllTablesLoaded(duckDb)) {
      throw new Error('Required database tables have not been loaded');
    }

    // Add period dates to config if available
    const config = {
      ...(configInput as object),
      ...getPeriodDatesConfig(),
    };

    // Create report based on remote source
    const report = createReport(reportSrcResponse.data as string);

    // Let the report validate the config before running it. Report will throw an
    // error if config is invalid.
    report.validateConfig(config);

    // Connect to database
    const conn = await duckDb.db.connect();

    // Run report using config and database connection
    const response = await report.run(config, conn);

    // Default report format is json but csv is also supported
    if (format === 'csv') {
      const parser = new Parser();
      return parser.parse(response.toArray());
    }

    return response;
  };

  return {
    run,
    duckDb,
  };
}
