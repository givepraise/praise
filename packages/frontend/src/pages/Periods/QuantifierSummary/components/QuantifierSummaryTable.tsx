import { useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { Praise } from '@/components/praise/Praise';
import {
  usePeriodQuantifierPraise,
  PeriodAndQuantifierPageParams,
} from '@/model/periods';
import { PraiseRow } from '@/components/praise/PraiseRow';
import { AllPraiseList } from '@/model/praise';
import { periodQuantifierPraiseListKey } from '@/utils/periods';
import { Box } from '@/components/ui/Box';

export const QuantifierSummaryTable = (): JSX.Element | null => {
  const { periodId, quantifierId } = useParams<PeriodAndQuantifierPageParams>();
  usePeriodQuantifierPraise(periodId, quantifierId);
  const praiseList = useRecoilValue(
    AllPraiseList(periodQuantifierPraiseListKey(periodId, quantifierId))
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
