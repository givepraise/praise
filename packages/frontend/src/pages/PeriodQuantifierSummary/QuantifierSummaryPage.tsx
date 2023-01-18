import { LoadPlaceholder } from '@/components/LoadPlaceholder';
import { Box } from '@/components/ui/Box';
import { BreadCrumb } from '@/components/ui/BreadCrumb';
import { Page } from '@/components/ui/Page';
import { BackLink } from '@/navigation/BackLink';
import { faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import React from 'react';
import { QuantifierSummaryHead } from './components/QuantifierSummaryHead';
import { QuantifierSummaryTable } from './components/QuantifierSummaryTable';

const QuantifierSummaryMessageFallback = (): JSX.Element => {
  return (
    <Box className="mb-5">
      <LoadPlaceholder height={180} />
    </Box>
  );
};

const QuantifierSummaryTableFallback = (): JSX.Element => {
  return (
    <Box>
      <LoadPlaceholder height={600} />
    </Box>
  );
};

const QuantifierSummaryPage = (): JSX.Element => {
  return (
    <Page>
      <BreadCrumb name={'Quantifier summary for period'} icon={faCalendarAlt} />
      <BackLink />

      <React.Suspense fallback={<QuantifierSummaryMessageFallback />}>
        <QuantifierSummaryHead />
      </React.Suspense>

      <React.Suspense fallback={<QuantifierSummaryTableFallback />}>
        <QuantifierSummaryTable />
      </React.Suspense>
    </Page>
  );
};

// eslint-disable-next-line import/no-default-export
export default QuantifierSummaryPage;
