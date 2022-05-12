import { useHistory } from 'react-router-dom';
import { UserDto, UserRole } from 'api/dist/user/types';
import RoleBadge from './RoleBadge';
import { UserAvatar } from '@/components/user/UserAvatar';
import { shortenEthAddress } from '@/utils/index';
import { getUsername } from '@/utils/users';

interface IUsersTableRow {
  data: UserDto;
}

const UsersTableRow = ({ data }: IUsersTableRow): JSX.Element => {
  const history = useHistory();
  return (
    <div
      className="my-3 px-4 flex justify-between items-center cursor-pointer h-12 rounded-md hover:bg-gray-100"
      onClick={(): void => history.push(`pool/${data._id}`)}
    >
      <div className="w-1/3 flex items-center gap-4">
        <UserAvatar user={data} />
        <span className=" font-mono text-sm">
          {shortenEthAddress(data.ethereumAddress!)}
        </span>
      </div>
      <div className="w-1/3">{getUsername(data)}</div>
      <div className="w-1/3">
        {data.roles.map((role, index) => {
          if (role !== UserRole.USER) {
            return <RoleBadge key={`${role}-${index}`} label={role} />;
          }
        })}
      </div>
    </div>
  );
};

export default UsersTableRow;
