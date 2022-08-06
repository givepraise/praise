import { faPrayingHands } from '@fortawesome/free-solid-svg-icons';
import React from 'react';
import { BreadCrumb } from '@/components/ui/BreadCrumb';
import { ActiveNoticesBoard } from '@/components/periods/ActiveNoticesBoard';
import { PraiseBox } from '@/components/ui/PraiseBox';
import { PraisePage } from '@/components/ui/PraisePage';
import { PraiseTable } from './components/PraiseTable';

const StartPage = (): JSX.Element => {
  return (
    <PraisePage>
      <BreadCrumb name="Praise" icon={faPrayingHands} />

      <ActiveNoticesBoard />

      <PraiseBox classes="p-0">
        <PraiseTable />
      </PraiseBox>
    </PraisePage>
  );
};

// eslint-disable-next-line import/no-default-export
export default StartPage;
