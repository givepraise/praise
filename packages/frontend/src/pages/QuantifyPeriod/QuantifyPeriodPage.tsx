import BreadCrumb from '@/components/BreadCrumb';
import {
  PeriodActiveQuantifierQuantifications,
  SinglePeriod,
} from '@/model/periods';
import BackLink from '@/navigation/BackLink';
import { faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import React from 'react';
import { useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import QuantifyPeriodTable from './components/QuantifyPeriodTable';

const PeriodMessage = () => {
  let { periodId } = useParams() as any;

  const period = useRecoilValue(SinglePeriod({ periodId }));
  const quantificationData = useRecoilValue(
    PeriodActiveQuantifierQuantifications({ periodId })
  );

  return (
    <>
      <h2>{period?.name}</h2>
      {quantificationData ? (
        <div>
          Assigned number of praise items: {quantificationData.count} <br />
          Items left to quantify this period:{' '}
          {quantificationData.count - quantificationData.done}
        </div>
      ) : null}
    </>
  );
};

const QuantifyPeriodPage = () => {
  return (
    <>
      <BreadCrumb name="Quantify" icon={faCalendarAlt} />
      <BackLink />

      <div className="w-2/3 praise-box">
        <React.Suspense fallback="Loading…">
          <PeriodMessage />
        </React.Suspense>
      </div>

      <div className="w-2/3 praise-box">
        <React.Suspense fallback="Loading…">
          <QuantifyPeriodTable />
        </React.Suspense>
      </div>
    </>
  );
};

export default QuantifyPeriodPage;
