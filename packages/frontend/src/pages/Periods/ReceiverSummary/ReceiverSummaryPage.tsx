import BreadCrumb from '@/components/BreadCrumb';
import { PeriodReceiver, SinglePeriod } from '@/model/periods';
import { SingleUserByReceiverId } from '@/model/users';
import BackLink from '@/navigation/BackLink';
import { getUsername } from '@/utils/users';
import { faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import React from 'react';
import { useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import PeriodReceiverTable from './components/ReceiverSummaryTable';

const PeriodReceiverMessage = () => {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  const { periodId, receiverId } = useParams() as any;
  const period = useRecoilValue(SinglePeriod({ periodId }));
  const user = useRecoilValue(SingleUserByReceiverId({ receiverId }));
  const receiverData = useRecoilValue(PeriodReceiver({ periodId, receiverId }));
  if (!period || !receiverData) return null;
  return (
    <>
      <h2>{user ? getUsername(user) : receiverData.username}</h2>
      <div className="mt-5">
        Period: {period.name}
        <br />
        Total praise score: {receiverData.praiseScore}
      </div>
    </>
  );
};

const QuantSummaryPeriodReceiverPage = () => {
  return (
    <>
      <BreadCrumb name={'Receiver summary for period'} icon={faCalendarAlt} />
      <BackLink />

      <div className="w-2/3 praise-box">
        <React.Suspense fallback="Loading…">
          <PeriodReceiverMessage />
        </React.Suspense>
      </div>

      <div className="praise-box">
        <React.Suspense fallback="Loading…">
          <PeriodReceiverTable />
        </React.Suspense>
      </div>
    </>
  );
};

export default QuantSummaryPeriodReceiverPage;
