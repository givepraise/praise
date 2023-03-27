import { useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import {
  PeriodAndGiverPageParams,
  usePeriodGiverPraise,
} from '@/model/periods/periods';
import { AllPraiseList } from '@/model/praise/praise';
import { periodGiverPraiseListKey } from '@/utils/periods';
import { GiverReceiverSummaryPraiseItems } from '../../Periods/components/GiverReceiverSummaryPraiseItems';

export const GiverSummaryTable = (): JSX.Element | null => {
  const { periodId, giverId } = useParams<PeriodAndGiverPageParams>();
  usePeriodGiverPraise(periodId, giverId);
  const praiseList = useRecoilValue(
    AllPraiseList(periodGiverPraiseListKey(periodId, giverId))
  );

  if (!praiseList) return null;
  return <GiverReceiverSummaryPraiseItems praiseList={praiseList} />;
};
