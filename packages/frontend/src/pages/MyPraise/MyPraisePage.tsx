import BreadCrumb from '@/components/BreadCrumb';
import { ActiveNoticesBoard } from '@/components/periods/ActiveNoticesBoard';
import { faPrayingHands } from '@fortawesome/free-solid-svg-icons';
import React from 'react';
import PraiseTable from './components/MyPraiseTable';

const MyPraise = (): JSX.Element => {
  return (
    <>
      <BreadCrumb name="My praise" icon={faPrayingHands} />

      <ActiveNoticesBoard />

      <div className="praise-box">
        <React.Suspense fallback="Loading…">
          <PraiseTable />
        </React.Suspense>
      </div>
    </>
  );
};

export default MyPraise;
