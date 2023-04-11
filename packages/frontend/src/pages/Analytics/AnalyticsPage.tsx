import { faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import React from 'react';
import { useRecoilValue } from 'recoil';
import { BreadCrumb } from '../../components/ui/BreadCrumb';
import { Page } from '../../components/ui/Page';
import { PeriodDetailsDto } from '../../model/periods/dto/period-details.dto';
import {
  AllPeriods,
  useLoadSinglePeriodDetails,
  SinglePeriod,
} from '../../model/periods/periods';
import { getPreviousPeriod } from '../../utils/periods';
import { DuckDb } from './components/DuckDb';
import PraiseOverTime from './components/PraiseOverTime';
import { differenceInDays, parseISO, subDays } from 'date-fns';
import TopPraiseGivers from './components/TopPraiseGivers';
import TopPraiseReceivers from './components/TopPraiseReceivers';
import PraiseScore from './components/PraiseScore';

const AnalyticsPage = (): JSX.Element | null => {
  const periodId = '6258683641e6d2310a9f4449';
  const allPeriods = useRecoilValue(AllPeriods);
  useLoadSinglePeriodDetails(periodId); // Fetch additional period details
  const period = useRecoilValue(SinglePeriod(periodId));
  const [previousPeriod, setPreviousPeriod] =
    React.useState<PeriodDetailsDto>();

  // Start date = end date of previous period
  React.useEffect(() => {
    if (period) {
      const previousPeriod = getPreviousPeriod(allPeriods, period);
      if (previousPeriod) {
        setPreviousPeriod(previousPeriod);
      }
    }
  }, [period, allPeriods]);

  if (!period || !previousPeriod) return null;

  const date2Str = previousPeriod.endDate;
  const date2 = parseISO(previousPeriod.endDate);

  const date3Str = period.endDate;
  const date3 = parseISO(period.endDate);

  const daysDiff = differenceInDays(date3, date2);

  const date1 = subDays(date2, daysDiff);
  const date1Str = date1.toISOString();

  return (
    <Page variant="full">
      <BreadCrumb name="Analytics" icon={faCalendarAlt} />

      <DuckDb startDate={date1Str} endDate={date3Str}>
        <div className="h-full gap-5 columns-1 md:columns-3">
          <PraiseOverTime date1={date1Str} date2={date2Str} date3={date3Str} />
          <PraiseScore date1={date1Str} date2={date2Str} date3={date3Str} />
          <TopPraiseGivers date1={date1Str} date2={date2Str} date3={date3Str} />
          <TopPraiseReceivers
            date1={date1Str}
            date2={date2Str}
            date3={date3Str}
          />
        </div>
      </DuckDb>
    </Page>
  );
};

export default AnalyticsPage;
