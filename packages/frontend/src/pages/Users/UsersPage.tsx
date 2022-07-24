import { faUserFriends } from '@fortawesome/free-solid-svg-icons';
import { useRecoilValue } from 'recoil';
import { BreadCrumb } from '@/components/BreadCrumb';
import { AllUsers } from '@/model/users';
import { UsersStatistics } from './components/UsersStatistics';
import { UsersTable } from './components/UsersTable';

const UsersPage = (): JSX.Element | null => {
  const allUsers = useRecoilValue(AllUsers);

  console.log(allUsers);
  if (!Array.isArray(allUsers)) return null;

  return (
    <div className="praise-page">
      <BreadCrumb name="Users" icon={faUserFriends} />
      <div className="mb-5 praise-box">
        <UsersStatistics />
      </div>
      <div className="px-0 praise-box">
        <UsersTable />
      </div>
    </div>
  );
};

// eslint-disable-next-line import/no-default-export
export default UsersPage;
