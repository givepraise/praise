import { useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { PeriodPageParams } from '@/model/periods';
import { Praise } from '@/components/praise/Praise';
import { PraiseRow } from '@/components/praise/PraiseRow';
import { ErrorPlaceholder } from '@/components/analytics/ErrorPlaceholder';
import { PeriodTop10Praise } from '@/model/periodAnalytics';

export const Top10Praise = (): JSX.Element => {
  const { periodId } = useParams<PeriodPageParams>();

  const top10Praise = useRecoilValue(PeriodTop10Praise(periodId));

  if (!top10Praise) {
    return <ErrorPlaceholder height={800} />;
  }

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
