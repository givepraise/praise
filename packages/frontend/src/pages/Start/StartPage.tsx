import BreadCrumb from '@/components/BreadCrumb';
import { ActivePeriodMessage } from '@/components/periods/ActivePeriodMessage';
import { ActiveUserQuantificationsMessage } from '@/components/periods/ActiveUserQuantificationsMessage';
import { faPrayingHands } from '@fortawesome/free-solid-svg-icons';
import React, { ReactElement } from 'react';
import PraiseTable from './components/PraiseTable';

const StartPage: React.FC = (): ReactElement => {
  return (
    <>
      <BreadCrumb name="Praise" icon={faPrayingHands} />

      <div className="w-2/3 praise-box">
        <React.Suspense fallback="Loading…">
          <ActivePeriodMessage />
          <ActiveUserQuantificationsMessage />
        </React.Suspense>
      </div>

      <div className="w-2/3 praise-box">
        <React.Suspense fallback="Loading…">
          <PraiseTable />
        </React.Suspense>
      </div>
    </>
  );
};

export default StartPage;
