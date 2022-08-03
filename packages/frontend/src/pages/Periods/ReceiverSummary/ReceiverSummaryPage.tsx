import { faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import {
  PeriodDetailsDto,
  PeriodDetailsReceiverDto,
} from 'api/dist/period/types';
import React from 'react';
import { useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';

import { BreadCrumb } from '@/components/ui/BreadCrumb';
import { PraisePage } from '@/components/ui/PraisePage';
import { PeriodAndReceiverPageParams, SinglePeriod } from '@/model/periods';
import { BackLink } from '@/navigation/BackLink';

import { ReceiverSummaryTable } from './components/ReceiverSummaryTable';

const getReceiver = (
  periodDetails: PeriodDetailsDto,
  receiverId: string
): PeriodDetailsReceiverDto | undefined => {
  return periodDetails.receivers?.find((r) => r._id === receiverId);
};

const PeriodReceiverMessage = (): JSX.Element | null => {
  const { periodId, receiverId } = useParams<PeriodAndReceiverPageParams>();
  const periodDetails = useRecoilValue(SinglePeriod(periodId));

  if (!periodDetails) return null;
  const receiver = getReceiver(periodDetails, receiverId);
  if (!receiver || !receiver.userAccount) return null;

  return (
    <div className="mb-5 praise-box">
      <h2>{receiver.userAccount.name}</h2>
      <div className="mt-5">
        Period: {periodDetails.name}
        <br />
        Total Score: {receiver.scoreRealized}
      </div>
    </div>
  );
};

const ReceiverSummaryPage = (): JSX.Element => {
  const { periodId } = useParams<PeriodAndReceiverPageParams>();

  return (
    <PraisePage>
      <BreadCrumb name={'Receiver summary for period'} icon={faCalendarAlt} />
      <BackLink to={`/periods/${periodId}`} />

      <React.Suspense fallback={null}>
        <PeriodReceiverMessage />
      </React.Suspense>

      <React.Suspense fallback={null}>
        <ReceiverSummaryTable />
      </React.Suspense>
    </PraisePage>
  );
};

// eslint-disable-next-line import/no-default-export
export default ReceiverSummaryPage;
