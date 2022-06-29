import { faPrayingHands } from '@fortawesome/free-solid-svg-icons';
import React, { ReactElement } from 'react';
import BreadCrumb from '@/components/BreadCrumb';
import { ActiveNoticesBoard } from '@/components/periods/ActiveNoticesBoard';
import PraiseTable from './components/PraiseTable';

const StartPage: React.FC = (): ReactElement => {
  return (
    <div className="praise-page">
      <BreadCrumb name="Praise" icon={faPrayingHands} />

      <ActiveNoticesBoard />

      <div className="p-0 praise-box">
        <React.Suspense fallback={null}>
          <PraiseTable />
        </React.Suspense>
      </div>
    </div>
  );
};

export default StartPage;
