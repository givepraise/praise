import { useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import {
  PeriodAndGiverPageParams,
  usePeriodGiverPraise,
} from '@/model/periods';
import { AllPraiseList } from '@/model/praise';
import { periodGiverPraiseListKey } from '@/utils/periods';
import { GiverReceiverSummaryPraiseItems } from '../../components/GiverReceiverSummaryPraiseItems';

export const GiverSummaryTable = (): JSX.Element | null => {
  const { periodId, giverId } = useParams<PeriodAndGiverPageParams>();
  usePeriodGiverPraise(periodId, giverId);
  const praiseList = useRecoilValue(
    AllPraiseList(periodGiverPraiseListKey(periodId, giverId))
  );

  if (!praiseList) return null;
  return <GiverReceiverSummaryPraiseItems praiseList={praiseList} />;
};
