import BreadCrumb from '@/components/BreadCrumb';
import { isResponseOk } from '@/model/api';
import { SinglePeriodDetailsQuery } from '@/model/periods';
import { SingleUserByReceiverId } from '@/model/users';
import BackLink from '@/navigation/BackLink';
import { getUsername } from '@/utils/users';
import { faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import { PeriodDetailsDto } from 'api/dist/period/types';
import React from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';

// const PraiseLoader = () => {
//   // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
//   const { periodId, receiverId } = useParams() as any;
//   const period = useRecoilValue(SinglePeriod({ periodId }));
//   const user = useRecoilValue(SingleUserByReceiverId({ receiverId }));
//   const receiverData = useRecoilValue(PeriodReceiver({ periodId, receiverId }));

//   const allPeriods = useRecoilValue(AllPeriods);
//   const previousPeriod = getPreviousPeriod(allPeriods, period);
//   const previousDate = previousPeriod
//     ? previousPeriod.endDate
//     : new Date(+0).toISOString();

//   const queryResponse = useAllPraiseQuery(
//     {
//       receiver: receiverId,
//       perdiodStart: previousDate,
//       periodEnd: period?.endDate,
//     },
//     `${periodId}/${receiverId}`
//   );

//   return null;
// };

const getPeriodScore = (
  periodDetails: PeriodDetailsDto,
  receiverId: string
): number | undefined => {
  const a = periodDetails.receivers.find((r) => r._id === receiverId);
  let b;
  return periodDetails.receivers.find((r) => r._id === receiverId)?.score;
};

const PeriodReceiverMessage = () => {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  const { periodId, receiverId } = useParams() as any;
  // const period = useRecoilValue(SinglePeriod({ periodId }));
  const user = useRecoilValue(SingleUserByReceiverId({ receiverId }));
  // const receiverData = useRecoilValue(PeriodReceiver({ periodId, receiverId }));
  // const [previousPeriodEndDate, setPreviousPeriodEndDate] = React.useState<
  //   string | null
  // >(null);
  // const allPeriods = useRecoilValue(AllPeriods);
  const { location } = useHistory();
  const periodDetailsReponse = useRecoilValue(
    SinglePeriodDetailsQuery({ periodId, refreshKey: location.key })
  );

  const periodDetails: PeriodDetailsDto | null = isResponseOk(
    periodDetailsReponse
  )
    ? (periodDetailsReponse.data as PeriodDetailsDto)
    : null;

  // React.useEffect(() => {
  //   if (allPeriods && periodDetails) {
  //     const previousPeriod = getPreviousPeriod(allPeriods, periodDetails);
  //     setPreviousPeriodEndDate(
  //       previousPeriod ? previousPeriod.endDate : new Date(+0).toISOString()
  //     );
  //   }
  // }, [allPeriods, periodDetails]);
  // if (!period || !receiverData) return null;
  if (!periodDetails || !user) return null;
  return (
    <>
      {/* {period && previousPeriodEndDate && (
        <PraiseLoader
          periodStart={previousPeriodEndDate}
          periodEnd={period.endDate}
        />
      )} */}
      <h2>{user ? getUsername(user) : null}</h2>
      <div className="mt-5">
        Period: {periodDetails.name}
        <br />
        Total praise score: {getPeriodScore(periodDetails, user._id)}
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

      {/* <div className="praise-box">
        <React.Suspense fallback="Loading…">
          <PeriodReceiverTable />
        </React.Suspense>
      </div> */}
    </>
  );
};

export default QuantSummaryPeriodReceiverPage;
