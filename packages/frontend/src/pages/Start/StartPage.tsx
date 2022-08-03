import { faPrayingHands } from '@fortawesome/free-solid-svg-icons';

import { ActiveNoticesBoard } from '@/components/periods/ActiveNoticesBoard';
import { BreadCrumb } from '@/components/ui/BreadCrumb';
import { PraisePage } from '@/components/ui/PraisePage';

import { PraiseTable } from './components/PraiseTable';

const StartPage = (): JSX.Element => {
  return (
    <PraisePage>
      <BreadCrumb name="Praise" icon={faPrayingHands} />

      <ActiveNoticesBoard />

      <div className="p-0 praise-box">
        <PraiseTable />
      </div>
    </PraisePage>
  );
};

// eslint-disable-next-line import/no-default-export
export default StartPage;
