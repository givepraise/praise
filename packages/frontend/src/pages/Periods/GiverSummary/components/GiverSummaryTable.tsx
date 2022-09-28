import { useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { Praise } from '@/components/praise/Praise';
import {
  PeriodAndGiverPageParams,
  usePeriodGiverPraise,
} from '@/model/periods';
import { PraiseRow } from '@/components/praise/PraiseRow';
import { AllPraiseList } from '@/model/praise';
import { periodGiverPraiseListKey } from '@/utils/periods';
import { Box } from '@/components/ui/Box';

export const GiverSummaryTable = (): JSX.Element | null => {
  const { periodId, giverId } = useParams<PeriodAndGiverPageParams>();
  usePeriodGiverPraise(periodId, giverId);
  const praiseList = useRecoilValue(
    AllPraiseList(periodGiverPraiseListKey(periodId, giverId))
  );

  if (!praiseList) return null;

  return (
    <Box className="p-0">
      <ul>
        {praiseList?.map((praise) => (
          <PraiseRow praise={praise} key={praise?._id}>
            <Praise praise={praise} className="p-5" />
          </PraiseRow>
        ))}
      </ul>
    </Box>
  );
};
