import { faUserFriends } from '@fortawesome/free-solid-svg-icons';
import { useRecoilValue } from 'recoil';
import { BreadCrumb } from '@/components/ui/BreadCrumb';
import { AllUsers } from '@/model/users';
import { PraiseBox } from '@/components/ui/PraiseBox';
import { PraisePage } from '@/components/ui/PraisePage';
import { UsersStatistics } from './components/UsersStatistics';
import { UsersTable } from './components/UsersTable';

const UsersPage = (): JSX.Element | null => {
  const allUsers = useRecoilValue(AllUsers);

  if (!Array.isArray(allUsers)) return null;

  return (
    <PraisePage>
      <BreadCrumb name="Users" icon={faUserFriends} />
      <PraiseBox classes="mb-5">
        <UsersStatistics />
      </PraiseBox>
      <PraiseBox classes="px-0">
        <UsersTable />
      </PraiseBox>
    </PraisePage>
  );
};

// eslint-disable-next-line import/no-default-export
export default UsersPage;
