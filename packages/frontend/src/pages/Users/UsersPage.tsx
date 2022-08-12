import { faUserFriends } from '@fortawesome/free-solid-svg-icons';
import { useRecoilValue } from 'recoil';
import { BreadCrumb } from '@/components/ui/BreadCrumb';
import { AllUsers } from '@/model/users';
import { Box } from '@/components/ui/Box';
import { Page } from '@/components/ui/Page';
import { UsersStatistics } from './components/UsersStatistics';
import { UsersTable } from './components/UsersTable';

const UsersPage = (): JSX.Element | null => {
  const allUsers = useRecoilValue(AllUsers);

  if (!Array.isArray(allUsers)) return null;

  return (
    <Page>
      <BreadCrumb name="Users" icon={faUserFriends} />
      <Box className="mb-5">
        <UsersStatistics />
      </Box>
      <Box className="px-0">
        <UsersTable />
      </Box>
    </Page>
  );
};

// eslint-disable-next-line import/no-default-export
export default UsersPage;
