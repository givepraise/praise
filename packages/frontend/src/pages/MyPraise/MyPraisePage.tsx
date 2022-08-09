import { faPrayingHands } from '@fortawesome/free-solid-svg-icons';
import { BreadCrumb } from '@/components/ui/BreadCrumb';
import { ActiveNoticesBoard } from '@/components/periods/ActiveNoticesBoard';
import { Box } from '@/components/ui/Box';
import { Page } from '@/components/ui/Page';
import { MyPraiseTable } from './components/MyPraiseTable';

const MyPraise = (): JSX.Element => {
  return (
    <Page>
      <BreadCrumb name="My praise" icon={faPrayingHands} />

      <ActiveNoticesBoard />

      <Box className="p-0">
        <MyPraiseTable />
      </Box>
    </Page>
  );
};

// eslint-disable-next-line import/no-default-export
export default MyPraise;
