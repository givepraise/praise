import { faChartArea } from '@fortawesome/free-solid-svg-icons';
import { useRecoilValue } from 'recoil';
import { BreadCrumb } from '../../components/ui/BreadCrumb';
import { Page } from '../../components/ui/Page';
import { DuckDb } from './components/DuckDb';
import PraiseOverTime from './components/PraiseOverTime';
import { differenceInDays, subDays } from 'date-fns';
import TopPraiseGivers from './components/TopPraiseGivers';
import TopPraiseReceivers from './components/TopPraiseReceivers';
import {
  DatePeriodRange,
  DatePeriodRangeEndDate,
  DatePeriodRangePeriod,
  DatePeriodRangeStartDate,
} from '../../components/report/DatePeriodRange';
import PraiseScoreOverTime from './components/PraiseScoreOverTime';
import TopPraise from './components/TopPraise';
import {
  AllPeriods,
  SinglePeriod,
  useLoadSinglePeriodDetails,
} from '../../model/periods/periods';
import { Link } from 'react-router-dom';
import * as check from 'wasm-check';

const Graphs = (): JSX.Element | null => {
  const date2 = useRecoilValue(DatePeriodRangeStartDate);
  const date3 = useRecoilValue(DatePeriodRangeEndDate);

  if (!date2 || !date3) return null;

  const daysDiff = differenceInDays(date3, date2);
  const date1 = subDays(date2, daysDiff);
  const date1Str = date1.toISOString();
  const date2Str = date2.toISOString();
  const date3Str = date3.toISOString();

  return (
    <DuckDb startDate={date1Str} endDate={date3Str}>
      <div className="gap-5 columns-1 md:columns-2 xl:columns-3">
        <TopPraise date1={date1Str} date2={date2Str} date3={date3Str} />
        <PraiseOverTime date1={date1Str} date2={date2Str} date3={date3Str} />
        <TopPraiseGivers date1={date1Str} date2={date2Str} date3={date3Str} />
        <PraiseScoreOverTime
          date1={date1Str}
          date2={date2Str}
          date3={date3Str}
        />
        <TopPraiseReceivers
          date1={date1Str}
          date2={date2Str}
          date3={date3Str}
        />
      </div>
    </DuckDb>
  );
};

const NoPeriodsMessage = (): JSX.Element | null => {
  return (
    <div className="w-full p-5 mb-5 border rounded-none shadow-none md:shadow-md md:rounded-xl bg-warm-gray-50 dark:bg-slate-600 break-inside-avoid-column">
      Analytics will be available once you have created your first{' '}
      <Link to="/periods">praise period</Link>.
    </div>
  );
};

const NoPraiseMessage = (): JSX.Element | null => {
  return (
    <div className="w-full p-5 mb-5 border rounded-none shadow-none md:shadow-md md:rounded-xl bg-warm-gray-50 dark:bg-slate-600 break-inside-avoid-column">
      Analytics will be available once some praise has been given.
    </div>
  );
};

const NoWasmMessage = (): JSX.Element | null => {
  return (
    <div className="w-full p-5 mb-5 border rounded-none shadow-none md:shadow-md md:rounded-xl bg-warm-gray-50 dark:bg-slate-600 break-inside-avoid-column">
      This web browser does not support WebAssembly. WebAssembly is required to
      view analytics.
    </div>
  );
};

const AnalyticsPage = (): JSX.Element => {
  const periodId = useRecoilValue(DatePeriodRangePeriod);
  useLoadSinglePeriodDetails(periodId);
  const period = useRecoilValue(SinglePeriod(periodId));
  const allPeriods = useRecoilValue(AllPeriods);
  const isWasmSupported = check.support();

  return (
    <Page variant="full">
      <BreadCrumb name="Analytics" icon={faChartArea} />
      {isWasmSupported ? (
        <>
          <DatePeriodRange />
          {allPeriods.length === 0 && <NoPeriodsMessage />}
          {period && period.numberOfPraise > 0 ? (
            <Graphs />
          ) : (
            <NoPraiseMessage />
          )}
        </>
      ) : (
        <NoWasmMessage />
      )}
    </Page>
  );
};

export default AnalyticsPage;
