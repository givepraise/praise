import { useRecoilValue } from 'recoil';
import { CSVLink } from 'react-csv';
import {
  AllAdminUsers,
  AllForwarderUsers,
  AllQuantifierUsers,
  AllUsers,
} from '@/model/users';

const UsersStatistics = (): JSX.Element => {
  const allAdminUsers = useRecoilValue(AllAdminUsers);
  const allForwarderUsers = useRecoilValue(AllForwarderUsers);
  const allQuantifierUsers = useRecoilValue(AllQuantifierUsers);
  const allUsers = useRecoilValue(AllUsers);

  return (
    <div className="praise-box flex justify-between">
      {console.log(allUsers)}
      <div className="max-w-1/2">
        <div className="mb-4">
          <span className="font-bold text-xl">User statistics</span>
        </div>
        <div>Activated users: {allUsers?.length}</div>
        <div>Admins: {allAdminUsers?.length}</div>
        <div>Forwarders: {allForwarderUsers?.length}</div>
        <div>Quantifiers: {allQuantifierUsers?.length}</div>
      </div>
      <CSVLink
        className="mt-auto praise-button-small h-fit bg-black px-2 py-1 rounded"
        data={allUsers}
        separator={';'}
      >
        <span className="font-medium text-white uppercase no-underline">
          download csv
        </span>
      </CSVLink>
    </div>
  );
};

export default UsersStatistics;
