import { UserWithStatsDto } from '@/model/user/dto/user-with-stats.dto';
import { UserRole } from '@/model/user/enums/user-role.enum';
import { useAdminUsers } from '@/model/user/users';
import { classNames } from '@/utils/index';
import { toast } from 'react-hot-toast';

interface Params {
  user: UserWithStatsDto;
  roles: UserRole[];
}

export const UserInfoAdminRolesInput = ({
  user,
  roles,
}: Params): JSX.Element => {
  const { addRole, removeRole } = useAdminUsers();

  const handleRole = async (
    role: UserRole,
    user: UserWithStatsDto
  ): Promise<void> => {
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

    return Promise.resolve();
  };

  return (
    <div className="flex flex-wrap gap-4 pt-5">
      {roles.map((role) => (
        <div
          key={role}
          className={classNames(
            'flex gap-2 justify-center items-center py-2 px-3 rounded-md bg-themecolor-alt-2',
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
          <label className="text-white " htmlFor={role}>
            {role}
          </label>
        </div>
      ))}
    </div>
  );
};
