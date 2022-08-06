import { shortenEthAddress } from 'api/dist/user/utils/core';
import { faUserGroup } from '@fortawesome/free-solid-svg-icons';
import { useRecoilValue } from 'recoil';
import { useParams } from 'react-router-dom';
import { UserDto, UserRole } from 'api/dist/user/types';
import { toast } from 'react-hot-toast';
import { BreadCrumb } from '@/components/ui/BreadCrumb';
import { SingleUser, SingleUserParams, useAdminUsers } from '@/model/users';
import { DATE_FORMAT, formatIsoDateUTC } from '@/utils/date';
import { classNames } from '@/utils/index';
import { BackLink } from '@/navigation/BackLink';
import { PraiseBox } from '@/components/ui/PraiseBox';
import { PraisePage } from '@/components/ui/PraisePage';

const roles = [UserRole.ADMIN, UserRole.FORWARDER, UserRole.QUANTIFIER];

const UserDetailsPage = (): JSX.Element | null => {
  const { userId } = useParams<SingleUserParams>();
  const user = useRecoilValue(SingleUser(userId));
  const { addRole, removeRole } = useAdminUsers();

  const handleRole = async (role: UserRole, user: UserDto): Promise<void> => {
    let resp;
    const isRemove = user.roles.includes(role);
    if (isRemove) {
      resp = await removeRole(user._id, role);
    } else {
      resp = await addRole(user._id, role);
    }
    if (resp?.status === 200) {
      toast.success(`Role ${isRemove ? 'removed' : 'added'} successfully!`);
    }
  };

  if (!user) return null;

  return (
    <PraisePage>
      <BreadCrumb name="User details" icon={faUserGroup} />
      <BackLink to="/users" />
      <PraiseBox classes="flex flex-col gap-2 mb-5">
        <span>User identity</span>
        <span className="text-xl font-bold">
          {user.ethereumAddress && shortenEthAddress(user.ethereumAddress)}
        </span>
        <div>
          Created: {formatIsoDateUTC(user.createdAt, DATE_FORMAT)}
          <br />
          Last updated: {formatIsoDateUTC(user.updatedAt, DATE_FORMAT)}
        </div>
      </PraiseBox>
      <PraiseBox classes="flex flex-col gap-2 mb-5">
        <span>Linked Discord identity</span>
        {user?.accounts?.map((account) => (
          <>
            <span className="text-xl font-bold">{account.name}</span>
            <div>
              Discord User ID: {account.user}
              <br />
              Created: {formatIsoDateUTC(account.createdAt, DATE_FORMAT)}
              <br />
              Last updated: {formatIsoDateUTC(account.updatedAt, DATE_FORMAT)}
            </div>
          </>
        ))}
      </PraiseBox>
      <PraiseBox>
        <span className="text-xl font-bold">Roles</span>
        <div className="flex flex-wrap gap-4 pt-5">
          {roles.map((role) => (
            <div
              key={role}
              className={classNames(
                'flex gap-2 justify-center items-center py-2 px-3 rounded-md cursor-pointer bg-themecolor-alt-2',
                user.roles.includes(role) ? '' : 'opacity-50'
              )}
              onClick={(): void => void handleRole(role, user)}
            >
              <input
                checked={user.roles.includes(role)}
                className="cursor-pointer"
                name={role}
                type="checkbox"
                readOnly
              />
              <label className="text-white cursor-pointer" htmlFor={role}>
                {role}
              </label>
            </div>
          ))}
        </div>
      </PraiseBox>
    </PraisePage>
  );
};

// eslint-disable-next-line import/no-default-export
export default UserDetailsPage;
