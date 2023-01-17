import { faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import React from 'react';
import { useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import {
  PeriodAndReceiverPageParams,
  SinglePeriod,
} from '@/model/periods/periods';
import { BreadCrumb } from '@/components/ui/BreadCrumb';
import { BackLink } from '@/navigation/BackLink';
import { Box } from '@/components/ui/Box';
import { Page } from '@/components/ui/Page';
import { ReceiverSummaryTable } from './components/ReceiverSummaryTable';
import { PeriodDetailsGiverReceiverDto } from '@/model/periods/dto/period-details-giver-receiver.dto';
import { PeriodDetailsDto } from '@/model/periods/dto/period-details.dto';

const getReceiver = (
  periodDetails: PeriodDetailsDto,
  receiverId: string
): PeriodDetailsGiverReceiverDto | undefined => {
  return periodDetails.receivers?.find((r) => r._id === receiverId);
};

const PeriodReceiverMessage = (): JSX.Element | null => {
  const { periodId, receiverId } = useParams<PeriodAndReceiverPageParams>();
  const periodDetails = useRecoilValue(SinglePeriod(periodId));

  if (!periodDetails) return null;
  const receiver = getReceiver(periodDetails, receiverId);
  if (!receiver || !receiver.userAccount) return null;

  return (
    <Box className="mb-5">
      <h2>{receiver.userAccount.name}</h2>
      <div className="mt-5">
        Period: {periodDetails.name}
        <br />
        Total score, praise received: {receiver.score}
      </div>
    </Box>
  );
};

const ReceiverSummaryPage = (): JSX.Element => {
  return (
    <Page>
      <BreadCrumb name={'Receiver summary for period'} icon={faCalendarAlt} />
      <BackLink />

      <React.Suspense fallback={null}>
        <PeriodReceiverMessage />
      </React.Suspense>

      <React.Suspense fallback={null}>
        <ReceiverSummaryTable />
      </React.Suspense>
    </Page>
  );
};

// eslint-disable-next-line import/no-default-export
export default ReceiverSummaryPage;
