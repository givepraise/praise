import { faPrayingHands } from '@fortawesome/free-solid-svg-icons';
import React from 'react';
import { BreadCrumb } from '@/components/ui/BreadCrumb';
import { ActiveNoticesBoard } from '@/components/periods/ActiveNoticesBoard';
import { Box } from '@/components/ui/Box';
import { Page } from '@/components/ui/Page';
import { PraiseTable } from './components/PraiseTable';

const StartPage = (): JSX.Element => {
  return (
    <Page>
      <BreadCrumb name="Praise" icon={faPrayingHands} />

      <ActiveNoticesBoard />

      <Box className="p-0">
        <PraiseTable />
      </Box>
    </Page>
  );
};

// eslint-disable-next-line import/no-default-export
export default StartPage;
