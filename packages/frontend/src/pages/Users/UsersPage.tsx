import { faUserFriends } from '@fortawesome/free-solid-svg-icons';
import { useRecoilValue } from 'recoil';

import { BreadCrumb } from '@/components/ui/BreadCrumb';
import { PraisePage } from '@/components/ui/PraisePage';
import { AllUsers } from '@/model/users';

import { UsersStatistics } from './components/UsersStatistics';
import { UsersTable } from './components/UsersTable';

const UsersPage = (): JSX.Element | null => {
  const allUsers = useRecoilValue(AllUsers);

  if (!Array.isArray(allUsers)) return null;

  return (
    <PraisePage>
      <BreadCrumb name="Users" icon={faUserFriends} />
      <div className="mb-5 praise-box">
        <UsersStatistics />
      </div>
      <div className="px-0 praise-box">
        <UsersTable />
      </div>
    </PraisePage>
  );
};

// eslint-disable-next-line import/no-default-export
export default UsersPage;
