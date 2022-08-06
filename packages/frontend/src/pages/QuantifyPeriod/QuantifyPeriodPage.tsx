import { faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import React from 'react';
import { useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { BreadCrumb } from '@/components/ui/BreadCrumb';
import {
  PeriodPageParams,
  PeriodQuantifierReceivers,
  SinglePeriod,
  usePeriodQuantifierPraise,
} from '@/model/periods';
import { getQuantificationStats } from '@/utils/periods';
import { BackLink } from '@/navigation/BackLink';
import { PraiseBox } from '@/components/ui/PraiseBox';
import { PraisePage } from '@/components/ui/PraisePage';
import { QuantifyPeriodTable } from './components/QuantifyPeriodTable';

const PeriodMessage = (): JSX.Element => {
  const { periodId } = useParams<PeriodPageParams>();
  const period = useRecoilValue(SinglePeriod(periodId));
  const quantificationStats = getQuantificationStats(
    useRecoilValue(PeriodQuantifierReceivers(periodId))
  );

  return (
    <>
      <h2>{period?.name}</h2>
      {quantificationStats ? (
        <div>
          Assigned number of praise items: {quantificationStats.count}
          <br />
          Items left to quantify:{' '}
          {quantificationStats.count - quantificationStats.done}
        </div>
      ) : null}
    </>
  );
};

const QuantifyPeriodPage = (): JSX.Element | null => {
  const { periodId } = useParams<PeriodPageParams>();
  const period = useRecoilValue(SinglePeriod(periodId));
  const periodQuantifierPraise = usePeriodQuantifierPraise(periodId);

  if (!period || !periodQuantifierPraise) return null;

  return (
    <PraisePage>
      <BreadCrumb name="Quantify" icon={faCalendarAlt} />
      <BackLink to={`/periods/${periodId}`} />

      <React.Suspense fallback={null}>
        <PraiseBox classes="mb-5">
          <PeriodMessage />
        </PraiseBox>
      </React.Suspense>

      <React.Suspense fallback={null}>
        <PraiseBox classes="px-0">
          <QuantifyPeriodTable />
        </PraiseBox>
      </React.Suspense>
    </PraisePage>
  );
};

// eslint-disable-next-line import/no-default-export
export default QuantifyPeriodPage;
