import { useRecoilValue } from 'recoil';

import {
  AllAdminUsers,
  AllForwarderUsers,
  AllQuantifierUsers,
  AllUsers,
} from '@/model/user/users';

export const UsersStatistics = (): JSX.Element => {
  const allAdminUsers = useRecoilValue(AllAdminUsers);
  const allForwarderUsers = useRecoilValue(AllForwarderUsers);
  const allQuantifierUsers = useRecoilValue(AllQuantifierUsers);
  const allUsers = useRecoilValue(AllUsers);

  return (
    <>
      <h2>User statistics</h2>
      <div>Activated users: {allUsers?.length}</div>
      <div>Admins: {allAdminUsers?.length}</div>
      <div>Forwarders: {allForwarderUsers?.length}</div>
      <div>Quantifiers: {allQuantifierUsers?.length}</div>
    </>
  );
};
