import BreadCrumb from '@/components/BreadCrumb';
import { ActiveNoticesBoard } from '@/components/periods/ActiveNoticesBoard';
import { faPrayingHands } from '@fortawesome/free-solid-svg-icons';
import React from 'react';
import MyPraiseTable from './components/MyPraiseTable';

const MyPraise = (): JSX.Element => {
  return (
    <div className="max-w-2xl mx-auto">
      <BreadCrumb name="My praise" icon={faPrayingHands} />

      <ActiveNoticesBoard />

      <div className="praise-box">
        <React.Suspense fallback="Loading…">
          <MyPraiseTable />
        </React.Suspense>
      </div>
    </div>
  );
};

export default MyPraise;
