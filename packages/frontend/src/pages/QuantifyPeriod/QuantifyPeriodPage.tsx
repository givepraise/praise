import { faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import React from 'react';
import { useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';

import { BreadCrumb } from '@/components/ui/BreadCrumb';
import { PraisePage } from '@/components/ui/PraisePage';
import {
  PeriodPageParams,
  PeriodQuantifierReceivers,
  SinglePeriod,
  usePeriodQuantifierPraise,
} from '@/model/periods';
import { BackLink } from '@/navigation/BackLink';
import { getQuantificationStats } from '@/utils/periods';

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
        <div className="mb-5 praise-box">
          <PeriodMessage />
        </div>
      </React.Suspense>

      <React.Suspense fallback={null}>
        <div className="px-0 praise-box">
          <QuantifyPeriodTable />
        </div>
      </React.Suspense>
    </PraisePage>
  );
};

// eslint-disable-next-line import/no-default-export
export default QuantifyPeriodPage;
