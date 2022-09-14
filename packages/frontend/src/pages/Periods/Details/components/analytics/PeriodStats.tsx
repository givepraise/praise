import { useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { PeriodPageParams } from '@/model/periods';
import { PeriodStatsSelector } from '@/model/periodAnalytics';

export const PeriodStats = (): JSX.Element | null => {
  const { periodId } = useParams<PeriodPageParams>();
  const periodStats = useRecoilValue(PeriodStatsSelector(periodId));

  if (!periodStats) return null;

  return (
    <div>
      Total number of praise: {periodStats.totalPraise}
      <br />
      Total praise score: {Math.floor(periodStats.totalPraiseScoreRealized)}
    </div>
  );
};
