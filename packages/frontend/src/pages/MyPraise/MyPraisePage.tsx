import { faPrayingHands } from '@fortawesome/free-solid-svg-icons';
import React from 'react';

import { ActiveNoticesBoard } from '@/components/periods/ActiveNoticesBoard';
import { BreadCrumb } from '@/components/ui/BreadCrumb';
import { PraisePage } from '@/components/ui/PraisePage';

import { MyPraiseTable } from './components/MyPraiseTable';

const MyPraise = (): JSX.Element => {
  return (
    <PraisePage>
      <BreadCrumb name="My praise" icon={faPrayingHands} />

      <ActiveNoticesBoard />

      <div className="p-0 praise-box">
        <MyPraiseTable />
      </div>
    </PraisePage>
  );
};

// eslint-disable-next-line import/no-default-export
export default MyPraise;
