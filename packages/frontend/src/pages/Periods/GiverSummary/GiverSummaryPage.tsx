import { faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import React from 'react';
import { useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import {
  PeriodAndGiverPageParams,
  SinglePeriod,
} from '@/model/periods/periods';
import { BreadCrumb } from '@/components/ui/BreadCrumb';
import { BackLink } from '@/navigation/BackLink';
import { Box } from '@/components/ui/Box';
import { Page } from '@/components/ui/Page';
import { GiverSummaryTable } from './components/GiverSummaryTable';
import { PeriodDetailsGiverReceiverDto } from '@/model/periods/dto/period-details-giver-receiver.dto';
import { PeriodDetailsDto } from '@/model/periods/dto/period-details.dto';

const getGiver = (
  periodDetails: PeriodDetailsDto,
  giverId: string
): PeriodDetailsGiverReceiverDto | undefined => {
  return periodDetails.givers?.find((r) => r._id === giverId);
};

const PeriodGiverMessage = (): JSX.Element | null => {
  const { periodId, giverId } = useParams<PeriodAndGiverPageParams>();
  const periodDetails = useRecoilValue(SinglePeriod(periodId));

  if (!periodDetails) return null;
  const giver = getGiver(periodDetails, giverId);
  if (!giver) return null;

  return (
    <Box className="mb-5">
      <h2>{giver.name}</h2>
      <div className="mt-5">
        Period: {periodDetails.name}
        <br />
        Total score, praise given: {giver.score}
      </div>
    </Box>
  );
};

const GiverSummaryPage = (): JSX.Element => {
  return (
    <Page>
      <BreadCrumb name={'Giver summary for period'} icon={faCalendarAlt} />
      <BackLink />

      <React.Suspense fallback={null}>
        <PeriodGiverMessage />
      </React.Suspense>

      <React.Suspense fallback={null}>
        <GiverSummaryTable />
      </React.Suspense>
    </Page>
  );
};

// eslint-disable-next-line import/no-default-export
export default GiverSummaryPage;
