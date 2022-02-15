import BreadCrumb from '@/components/BreadCrumb';
import { isResponseOk } from '@/model/api';
import {
  AllPeriods,
  PeriodReceiver,
  SinglePeriod,
  SinglePeriodDetailsQuery,
} from '@/model/periods';
import { useAllPraiseQuery } from '@/model/praise';
import { SingleUserByReceiverId } from '@/model/users';
import BackLink from '@/navigation/BackLink';
import { getPreviousPeriod } from '@/utils/periods';
import { getUsername } from '@/utils/users';
import { faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import { PeriodDetails } from 'api/dist/period/types';
import React from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import PeriodReceiverTable from './components/ReceiverSummaryTable';

const PraiseLoader = () => {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  const { periodId, receiverId } = useParams() as any;
  const period = useRecoilValue(SinglePeriod({ periodId }));
  const user = useRecoilValue(SingleUserByReceiverId({ receiverId }));
  const receiverData = useRecoilValue(PeriodReceiver({ periodId, receiverId }));

  const allPeriods = useRecoilValue(AllPeriods);
  const previousPeriod = getPreviousPeriod(allPeriods, period);
  const previousDate = previousPeriod
    ? previousPeriod.endDate
    : new Date(+0).toISOString();

  const queryResponse = useAllPraiseQuery(
    {
      receiver: receiverId,
      perdiodStart: previousDate,
      periodEnd: period?.endDate,
    },
    `${periodId}/${receiverId}`
  );

  return null;
};
const PeriodReceiverMessage = () => {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  const { periodId, receiverId } = useParams() as any;
  const period = useRecoilValue(SinglePeriod({ periodId }));
  const user = useRecoilValue(SingleUserByReceiverId({ receiverId }));
  // const receiverData = useRecoilValue(PeriodReceiver({ periodId, receiverId }));
  const [previousPeriodEndDate, setPreviousPeriodEndDate] = React.useState<
    string | null
  >(null);
  const allPeriods = useRecoilValue(AllPeriods);
  const { location } = useHistory();
  const periodDetailsReponse = useRecoilValue(
    SinglePeriodDetailsQuery({ periodId, refreshKey: location.key })
  );

  const periodDetails: PeriodDetails | null = isResponseOk(periodDetailsReponse)
    ? (periodDetailsReponse.data as PeriodDetails)
    : null;

  React.useEffect(() => {
    if (allPeriods && periodDetails) {
      const previousPeriod = getPreviousPeriod(allPeriods, periodDetails);
      setPreviousPeriodEndDate(
        previousPeriod ? previousPeriod.endDate : new Date(+0).toISOString()
      );
    }
  }, [allPeriods, periodDetails]);
  if (!period || !receiverData) return null;
  return (
    <>
      {period && previousPeriodEndDate && (
        <PraiseLoader
          periodStart={previousPeriodEndDate}
          periodEnd={period.endDate}
        />
      )}
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
