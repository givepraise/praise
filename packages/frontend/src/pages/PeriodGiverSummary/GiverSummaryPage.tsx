import { faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import React from 'react';
import { BreadCrumb } from '@/components/ui/BreadCrumb';
import { BackLink } from '@/navigation/BackLink';
import { Page } from '@/components/ui/Page';
import { GiverSummaryTable } from './components/GiverSummaryTable';
import { GiverSummaryHead } from './components/GiverSummaryHead';
import { Box } from '@/components/ui/Box';
import { LoadPlaceholder } from '@/components/LoadPlaceholder';

const GiverSummaryHeadFallback = (): JSX.Element => {
  return (
    <Box className="mb-5">
      <LoadPlaceholder height={100} />
    </Box>
  );
};

const GiverSummaryTableFallback = (): JSX.Element => {
  return (
    <Box>
      <LoadPlaceholder height={600} />
    </Box>
  );
};

const GiverSummaryPage = (): JSX.Element => {
  return (
    <Page>
      <BreadCrumb name={'Giver summary for period'} icon={faCalendarAlt} />
      <BackLink />

      <React.Suspense fallback={<GiverSummaryHeadFallback />}>
        <GiverSummaryHead />
      </React.Suspense>

      <React.Suspense fallback={<GiverSummaryTableFallback />}>
        <GiverSummaryTable />
      </React.Suspense>
    </Page>
  );
};

// eslint-disable-next-line import/no-default-export
export default GiverSummaryPage;
