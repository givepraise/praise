import React from 'react';
import { useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { PeriodPageParams, useLoadSinglePeriodDetails } from '@/model/periods';
import { PeriodStatsSelector } from '@/model/periodAnalytics';

export const PeriodStats = (): JSX.Element => {
  const { periodId } = useParams<PeriodPageParams>();
  useLoadSinglePeriodDetails(periodId);
  const periodStats = useRecoilValue(PeriodStatsSelector(periodId));

  return (
    <div>
      Total number of praise: {periodStats?.totalPraise}
      <br />
      Total praise score: {periodStats?.totalPraiseScoreRealized}
    </div>
  );
};
