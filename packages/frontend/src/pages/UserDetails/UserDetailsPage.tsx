import { faUserGroup } from '@fortawesome/free-solid-svg-icons';
import BreadCrumb from '@/components/BreadCrumb';
import BackLink from '@/navigation/BackLink';
import { SingleUser, SingleUserParams, useAdminUsers } from '@/model/users';
import { useRecoilValue } from 'recoil';
import { useParams } from 'react-router-dom';
import { formatIsoDateUTC } from '@/utils/date';
import { shortenEthAddress } from '@/utils/index';
import { UserDto, UserRole } from 'api/dist/user/types';
import { toast } from 'react-hot-toast';

const roles = [UserRole.ADMIN, UserRole.FORWARDER, UserRole.QUANTIFIER];

const UserDetailsPage = (): JSX.Element => {
  const { userId } = useParams<SingleUserParams>();
  const user = useRecoilValue(SingleUser({ userId }));
  const { addRole, removeRole } = useAdminUsers();

  const handleRole = (role: UserRole, user: UserDto): void => {
    let resp;
    const isRemove = user.roles.includes(role);
    async (): Promise<void> => {
      if (isRemove) {
        resp = await removeRole(user._id, role);
      } else {
        resp = await addRole(user._id, role);
      }
      if (resp?.status === 200) {
        toast.success(`Role ${isRemove ? 'removed' : 'added'} successfully!`);
      }
    };
  };

  return (
    <div className="max-w-2xl mx-auto">
      <BreadCrumb name="User details" icon={faUserGroup} />
      <BackLink to="/pool" />
      <div className="praise-box flex flex-col gap-2">
        <span>User identity</span>
        {!!user && (
          <>
            <span className="text-xl font-bold">
              {shortenEthAddress(user.ethereumAddress || '')}
            </span>
            <span>Created: {formatIsoDateUTC(user.createdAt)}</span>
            <span>Last updated: {formatIsoDateUTC(user.updatedAt)}</span>
          </>
        )}
      </div>
      <div className="praise-box flex flex-col gap-2">
        <span>Linked Discord identities</span>
        {user?.accounts?.map((account, index) => (
          <>
            <span>User account #{index + 1}</span>
            <span className="text-xl font-bold">{account.name}</span>
            <span>Discord User ID: {account.user}</span>
            <span>Created: {formatIsoDateUTC(account.createdAt)}</span>
            <span>Last updated: {formatIsoDateUTC(account.updatedAt)}</span>
          </>
        ))}
      </div>
      <div className="praise-box">
        <span className="text-xl font-bold">Roles</span>
        <div className="flex gap-4 pt-5">
          {!!user &&
            roles.map((role) => (
              <div
                key={role}
                className="flex gap-2 justify-center items-center bg-black py-2 px-3 rounded-md cursor-pointer"
                onClick={(): void => handleRole(role, user)}
              >
                <input
                  checked={user.roles.includes(role)}
                  className="text-lime-500 cursor-pointer"
                  name={role}
                  type="checkbox"
                  onChange={(): void => handleRole(role, user)}
                />
                <span className="text-white">{role}</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default UserDetailsPage;
