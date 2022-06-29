import { faUserFriends } from '@fortawesome/free-solid-svg-icons';
import BreadCrumb from '@/components/BreadCrumb';
import UsersStatistics from './components/UsersStatistics';
import UsersTable from './components/UsersTable';

const UsersPage = (): JSX.Element => {
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

export default UsersPage;
