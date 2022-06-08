import React from 'react';
import { useRecoilValue } from 'recoil';
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
    <div className="praise-box">
      <div className="mb-4">
        <span className="font-bold text-xl">User statistics</span>
      </div>
      <div>Activated users: {allUsers?.length}</div>
      <div>Admins: {allAdminUsers?.length}</div>
      <div>Forwarders: {allForwarderUsers?.length}</div>
      <div>Quantifiers: {allQuantifierUsers?.length}</div>
    </div>
  );
};

export default UsersStatistics;
