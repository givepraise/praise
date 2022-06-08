import { useRecoilValue } from 'recoil';
import { CSVLink } from 'react-csv';
import {
  AllAdminUsers,
  AllForwarderUsers,
  AllQuantifierUsers,
  AllUsers,
} from '@/model/users';
import { faDownload } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const UsersStatistics = (): JSX.Element => {
  const allAdminUsers = useRecoilValue(AllAdminUsers);
  const allForwarderUsers = useRecoilValue(AllForwarderUsers);
  const allQuantifierUsers = useRecoilValue(AllQuantifierUsers);
  const allUsers = useRecoilValue(AllUsers);

  return (
    <div className="praise-box">
      {console.log(allUsers)}
      <div className="mb-4">
        <span className="text-xl font-bold">User statistics</span>
      </div>
      <div>Activated users: {allUsers?.length}</div>
      <div>Admins: {allAdminUsers?.length}</div>
      <div>Forwarders: {allForwarderUsers?.length}</div>
      <div>Quantifiers: {allQuantifierUsers?.length}</div>
      <div className="flex w-full mt-5">
        {allUsers && (
          <div className="praise-button">
            <CSVLink className="no-underline" data={allUsers} separator={';'}>
              <FontAwesomeIcon icon={faDownload} size="1x" className="mr-2" />
              Export
            </CSVLink>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersStatistics;
