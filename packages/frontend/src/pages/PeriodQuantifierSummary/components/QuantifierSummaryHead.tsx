import { UserAvatarAndName } from '@/components/user/UserAvatarAndName';
import { PeriodSingleQuantifierStats } from '@/model/periods/periodAnalytics';
import {
  PeriodAndQuantifierPageParams,
  useSinglePeriodQuantifier,
  SinglePeriod,
} from '@/model/periods/periods';
import { Box } from '@/components/ui/Box';
import { useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';

export const QuantifierSummaryHead = (): JSX.Element | null => {
  const { periodId, quantifierId } = useParams<PeriodAndQuantifierPageParams>();
  const quantifier = useSinglePeriodQuantifier(periodId, quantifierId);
  const periodDetails = useRecoilValue(SinglePeriod(periodId));
  const quantifierStats = useRecoilValue(
    PeriodSingleQuantifierStats({ periodId, quantifierId })
  );

  if (!quantifier || !periodDetails || !quantifierStats) return null;

  return (
    <Box className="mb-5">
      <h2>
        <UserAvatarAndName userId={quantifier._id} />
      </h2>
      <div className="mt-5">
        Period: {periodDetails.name}
        <br />
        Finished/assigned quantifications: {quantifier.finishedCount} /{' '}
        {quantifier.praiseCount}
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
