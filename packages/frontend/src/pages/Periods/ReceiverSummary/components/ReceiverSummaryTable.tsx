import { useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import {
  PeriodAndReceiverPageParams,
  usePeriodReceiverPraise,
} from '@/model/periods/periods';
import { AllPraiseList } from '@/model/praise';
import { periodReceiverPraiseListKey } from '@/utils/periods';
import { GiverReceiverSummaryPraiseItems } from '../../components/GiverReceiverSummaryPraiseItems';

export const ReceiverSummaryTable = (): JSX.Element | null => {
  const { periodId, receiverId } = useParams<PeriodAndReceiverPageParams>();
  usePeriodReceiverPraise(periodId, receiverId);
  const praiseList = useRecoilValue(
    AllPraiseList(periodReceiverPraiseListKey(periodId, receiverId))
  );

  if (!praiseList) return null;
  return <GiverReceiverSummaryPraiseItems praiseList={praiseList} />;
};
