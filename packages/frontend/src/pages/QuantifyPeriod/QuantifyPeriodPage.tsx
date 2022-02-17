import BreadCrumb from '@/components/BreadCrumb';
import { ActiveUserId } from '@/model/auth';
import { SinglePeriod } from '@/model/periods';
import BackLink from '@/navigation/BackLink';
import { getQuantifierData } from '@/utils/periods';
import { faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import React from 'react';
import { useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import QuantifyPeriodTable from './components/QuantifyPeriodTable';

const PeriodMessage = () => {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  const { periodId } = useParams() as any;
  // const period = useSinglePeriodQuery(periodId);
  const period = useRecoilValue(SinglePeriod(periodId));
  const userId = useRecoilValue(ActiveUserId);
  const quantifierData = getQuantifierData(period, userId);

  return (
    <>
      <h2>{period?.name}</h2>
      {quantifierData ? (
        <div>
          Assigned number of praise items: {quantifierData.praiseCount}
          <br />
          Items left to quantify:{' '}
          {quantifierData.praiseCount - quantifierData.finishedCount}
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
