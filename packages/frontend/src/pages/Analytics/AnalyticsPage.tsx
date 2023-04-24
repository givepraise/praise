import { faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
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
  DatePeriodRangeStartDate,
} from '../../components/DatePeriodRange';
import PraiseScoreOverTime from './components/PraiseScoreOverTime';
import TopPraise from './components/TopPraise';

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
      <div className="h-full gap-5 columns-1 md:columns-2 xl:columns-3">
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
const AnalyticsPage = (): JSX.Element | null => {
  return (
    <Page variant="full">
      <BreadCrumb name="Analytics" icon={faCalendarAlt} />

      <DatePeriodRange />
      <Graphs />
    </Page>
  );
};

export default AnalyticsPage;
