import { Box } from '@/components/ui/Box';
import { UserAvatarAndName } from '@/components/user/UserAvatarAndName';
import {
  PeriodAndReceiverPageParams,
  useLoadSinglePeriodDetails,
  SinglePeriod,
  useSinglePeriodReceiver,
} from '@/model/periods/periods';
import { useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';

export const ReceiverSummaryHead = (): JSX.Element | null => {
  const { periodId, receiverId } = useParams<PeriodAndReceiverPageParams>();
  useLoadSinglePeriodDetails(periodId); // Load period details
  const periodDetails = useRecoilValue(SinglePeriod(periodId));
  const receiver = useSinglePeriodReceiver(periodId, receiverId);

  if (!periodDetails || !receiver) return null;

  return (
    <Box className="mb-5">
      <h2>
        <UserAvatarAndName userId={receiver.user} />
      </h2>
      <div className="mt-5">
        Period: {periodDetails.name}
        <br />
        Total score, praise received: {receiver.score}
      </div>
    </Box>
  );
};
