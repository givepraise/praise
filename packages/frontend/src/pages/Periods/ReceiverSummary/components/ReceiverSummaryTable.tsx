import { PraiseDetailsDto } from 'api/dist/praise/types';
import { useHistory, useParams } from 'react-router-dom';
import Praise from '@/components/praise/Praise';
import {
  PeriodAndReceiverPageParams,
  usePeriodReceiverPraiseQuery,
} from '@/model/periods';
interface PraiseRowProps {
  praise: PraiseDetailsDto;
}
const PraiseRow = ({ praise }: PraiseRowProps): JSX.Element => {
  const history = useHistory();

  const handleClick = (): void => {
    history.push(`/praise/${praise._id}`);
  };

  return (
    <div
      className="flex items-center w-full p-5 cursor-pointer hover:bg-gray-100"
      onClick={handleClick}
    >
      <Praise praise={praise} showReceiver={false} />
    </div>
  );
};

const PeriodReceiverTable = (): JSX.Element | null => {
  const { periodId, receiverId } = useParams<PeriodAndReceiverPageParams>();
  const { location } = useHistory();
  const praiseList = usePeriodReceiverPraiseQuery(
    periodId,
    receiverId,
    location?.key
  );

  if (!praiseList) return null;
  return (
    <div className="praise-box">
      {praiseList?.map((praise) => (
        <PraiseRow praise={praise} key={praise?._id} />
      ))}
    </div>
  );
};

export default PeriodReceiverTable;
