import React from 'react';
import { useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { PeriodPageParams } from '@/model/periods';
import { PeriodStatsSelector } from '@/model/periodAnalytics';
import { ErrorPlaceholder } from '@/components/analytics/ErrorPlaceholder';

export const PeriodStats = (): JSX.Element => {
  const { periodId } = useParams<PeriodPageParams>();
  const periodStats = useRecoilValue(PeriodStatsSelector(periodId));

  if (!periodStats) {
    return <ErrorPlaceholder height={80} />;
  }

  return (
    <div>
      Total number of praise: {periodStats.totalPraise}
      <br />
      Total praise score: {Math.floor(periodStats.totalPraiseScoreRealized)}
    </div>
  );
};
