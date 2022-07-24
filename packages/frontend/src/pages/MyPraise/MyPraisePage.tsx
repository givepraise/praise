import { faPrayingHands } from '@fortawesome/free-solid-svg-icons';
import React from 'react';
import { BreadCrumb } from '@/components/BreadCrumb';
import { ActiveNoticesBoard } from '@/components/periods/ActiveNoticesBoard';
import { MyPraiseTable } from './components/MyPraiseTable';

const MyPraise = (): JSX.Element => {
  return (
    <div className="praise-page">
      <BreadCrumb name="My praise" icon={faPrayingHands} />

      <ActiveNoticesBoard />

      <React.Suspense fallback={null}>
        <div className="p-0 praise-box">
          <MyPraiseTable />
        </div>
      </React.Suspense>
    </div>
  );
};

// eslint-disable-next-line import/no-default-export
export default MyPraise;
