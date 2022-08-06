import { faPrayingHands } from '@fortawesome/free-solid-svg-icons';
import { BreadCrumb } from '@/components/ui/BreadCrumb';
import { ActiveNoticesBoard } from '@/components/periods/ActiveNoticesBoard';
import { PraiseBox } from '@/components/ui/PraiseBox';
import { PraisePage } from '@/components/ui/PraisePage';
import { MyPraiseTable } from './components/MyPraiseTable';

const MyPraise = (): JSX.Element => {
  return (
    <PraisePage>
      <BreadCrumb name="My praise" icon={faPrayingHands} />

      <ActiveNoticesBoard />

      <PraiseBox classes="p-0">
        <MyPraiseTable />
      </PraiseBox>
    </PraisePage>
  );
};

// eslint-disable-next-line import/no-default-export
export default MyPraise;
