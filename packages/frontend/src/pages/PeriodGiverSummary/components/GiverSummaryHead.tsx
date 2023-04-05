import { Box } from '@/components/ui/Box';
import { UserAvatarAndName } from '@/components/user/UserAvatarAndName';
import {
  PeriodAndGiverPageParams,
  useLoadSinglePeriodDetails,
  SinglePeriod,
  useSinglePeriodGiver,
} from '@/model/periods/periods';
import { useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';

export const GiverSummaryHead = (): JSX.Element | null => {
  const { periodId, giverId } = useParams<PeriodAndGiverPageParams>();
  useLoadSinglePeriodDetails(periodId); // Load period details
  const periodDetails = useRecoilValue(SinglePeriod(periodId));
  const giver = useSinglePeriodGiver(periodId, giverId);

  if (!periodDetails || !giver) return null;

  return (
    <Box className="mb-5">
      <h2>
        <UserAvatarAndName userId={giver.user} />
      </h2>
      <div className="mt-5">
        Period: {periodDetails.name}
        <br />
        Total score, praise given: {giver.score}
      </div>
    </Box>
  );
};
