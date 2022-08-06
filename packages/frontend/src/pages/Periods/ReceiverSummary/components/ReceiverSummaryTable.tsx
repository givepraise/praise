import { useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { Praise } from '@/components/praise/Praise';
import {
  PeriodAndReceiverPageParams,
  usePeriodReceiverPraise,
} from '@/model/periods';
import { PraiseRow } from '@/components/praise/PraiseRow';
import { AllPraiseList } from '@/model/praise';
import { periodReceiverPraiseListKey } from '@/utils/periods';
import { PraiseBox } from '@/components/ui/PraiseBox';

export const ReceiverSummaryTable = (): JSX.Element | null => {
  const { periodId, receiverId } = useParams<PeriodAndReceiverPageParams>();
  usePeriodReceiverPraise(periodId, receiverId);
  const praiseList = useRecoilValue(
    AllPraiseList(periodReceiverPraiseListKey(periodId, receiverId))
  );

  if (!praiseList) return null;
  return (
    <PraiseBox classes="p-0">
      <ul>
        {praiseList?.map((praise) => (
          <PraiseRow praise={praise} key={praise?._id}>
            <Praise praise={praise} className="p-5" />
          </PraiseRow>
        ))}
      </ul>
    </PraiseBox>
  );
};
