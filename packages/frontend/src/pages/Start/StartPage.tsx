import { faPrayingHands } from '@fortawesome/free-solid-svg-icons';
import React from 'react';
import { BreadCrumb } from '@/components/BreadCrumb';
import { ActiveNoticesBoard } from '@/components/periods/ActiveNoticesBoard';
import { PraiseTable } from './components/PraiseTable';

const StartPage = (): JSX.Element => {
  return (
    <div className="praise-page">
      <BreadCrumb name="Praise" icon={faPrayingHands} />

      <ActiveNoticesBoard />

      <div className="p-0 praise-box">
        <PraiseTable />
      </div>
    </div>
  );
};

// eslint-disable-next-line import/no-default-export
export default StartPage;
