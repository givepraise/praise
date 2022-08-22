import { faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import React from 'react';
import { useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import {
  PeriodAndQuantifierPageParams,
  PeriodQuantifierReceivers,
  SinglePeriod,
} from '@/model/periods';
import { BreadCrumb } from '@/components/ui/BreadCrumb';
import { BackLink } from '@/navigation/BackLink';
import { Box } from '@/components/ui/Box';
import { Page } from '@/components/ui/Page';
import { SingleUser } from '@/model/users';
import { PeriodQuantifierStats } from '@/model/periodAnalytics';
import { QuantifierSummaryTable } from './components/QuantifierSummaryTable';

const QuantifierSummaryMessage = (): JSX.Element | null => {
  const { periodId, quantifierId } = useParams<PeriodAndQuantifierPageParams>();
  const quantifier = useRecoilValue(SingleUser(quantifierId));
  const periodDetails = useRecoilValue(SinglePeriod(periodId));
  const quantifierReceiverData = useRecoilValue(
    PeriodQuantifierReceivers({ periodId, quantifierId })
  );
  const allQuantifierStats = useRecoilValue(PeriodQuantifierStats(periodId));
  if (!quantifier || !periodDetails || !quantifierReceiverData) return null;

  const quantifierStats = allQuantifierStats?.find(
    (s) => s._id === quantifierId
  );
  return (
    <Box className="mb-5">
      <h2>{quantifier?.nameRealized}</h2>
      <div className="mt-5">
        Period: {periodDetails.name}
        <br />
        Assigned/finished quantifications:{' '}
        {quantifierReceiverData.reduce(
          (acc, curr) => acc + curr.count,
          0
        )} / {quantifierReceiverData.reduce((acc, curr) => acc + curr.done, 0)}
        <br />
        Total quantified praise score: {quantifierStats?.totalScore}
        <br />
        Mean praise score:{' '}
        {quantifierStats && quantifierStats.meanScore.toFixed(2)}
        <br />
        Median praise score:{' '}
        {quantifierStats && quantifierStats.medianScore.toFixed(2)}
      </div>
    </Box>
  );
};

const QuantifierSummaryPage = (): JSX.Element => {
  return (
    <Page>
      <BreadCrumb name={'Quantifier summary for period'} icon={faCalendarAlt} />
      <BackLink />

      <React.Suspense fallback={null}>
        <QuantifierSummaryMessage />
      </React.Suspense>

      <React.Suspense fallback={null}>
        <QuantifierSummaryTable />
      </React.Suspense>
    </Page>
  );
};

// eslint-disable-next-line import/no-default-export
export default QuantifierSummaryPage;
