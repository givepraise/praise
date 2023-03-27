import { BreadCrumb } from '@/components/ui/BreadCrumb';
import { Page } from '@/components/ui/Page';
import { BackLink } from '@/navigation/BackLink';
import { faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import React from 'react';
import { ReceiverSummaryTable } from './components/ReceiverSummaryTable';
import { ReceiverSummaryHead } from './components/ReceiverSummaryHead';
import { Box } from '@/components/ui/Box';
import { LoadPlaceholder } from '@/components/LoadPlaceholder';

const ReceiverSummaryHeadFallback = (): JSX.Element => {
  return (
    <Box className="mb-5">
      <LoadPlaceholder height={100} />
    </Box>
  );
};

const ReceiverSummaryTableFallback = (): JSX.Element => {
  return (
    <Box>
      <LoadPlaceholder height={600} />
    </Box>
  );
};

const ReceiverSummaryPage = (): JSX.Element => {
  return (
    <Page>
      <BreadCrumb name={'Receiver summary for period'} icon={faCalendarAlt} />
      <BackLink />

      <React.Suspense fallback={<ReceiverSummaryHeadFallback />}>
        <ReceiverSummaryHead />
      </React.Suspense>

      <React.Suspense fallback={<ReceiverSummaryTableFallback />}>
        <ReceiverSummaryTable />
      </React.Suspense>
    </Page>
  );
};

// eslint-disable-next-line import/no-default-export
export default ReceiverSummaryPage;
