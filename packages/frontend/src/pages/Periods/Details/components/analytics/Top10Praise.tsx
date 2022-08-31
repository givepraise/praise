import { useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { PeriodPageParams } from '@/model/periods';
import { Praise } from '@/components/praise/Praise';
import { PraiseRow } from '@/components/praise/PraiseRow';
import { PeriodTop10Praise } from '@/model/periodAnalytics';

export const Top10Praise = (): JSX.Element | null => {
  const { periodId } = useParams<PeriodPageParams>();

  const top10Praise = useRecoilValue(PeriodTop10Praise(periodId));

  if (!top10Praise) return null;

  return (
    <ul>
      {top10Praise.map((praise) => (
        <PraiseRow praise={praise} key={praise._id}>
          <Praise praise={praise} className="p-3" />
        </PraiseRow>
      ))}
    </ul>
  );
};
