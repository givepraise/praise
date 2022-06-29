import { useHistory, useParams } from 'react-router-dom';
import { Praise } from '@/components/praise/Praise';
import {
  PeriodAndReceiverPageParams,
  usePeriodReceiverPraiseQuery,
} from '@/model/periods';
import { PraiseRow } from '@/components/praise/PraiseRow';

export const ReceiverSummaryTable = (): JSX.Element | null => {
  const { periodId, receiverId } = useParams<PeriodAndReceiverPageParams>();
  const { location } = useHistory();
  const praiseList = usePeriodReceiverPraiseQuery(
    periodId,
    receiverId,
    location?.key
  );

  if (!praiseList) return null;
  return (
    <div className="p-0 praise-box">
      <ul>
        {praiseList?.map((praise) => (
          <PraiseRow praise={praise} key={praise?._id}>
            <Praise praise={praise} className="p-5" />
          </PraiseRow>
        ))}
      </ul>
    </div>
  );
};
