import { shortenEthAddress } from 'api/dist/user/utils';
import { useHistory } from 'react-router-dom';
import { UserDto, UserRole } from 'api/dist/user/types';
import { InlineLabel } from '@/components/InlineLabel';
import { UserAvatar } from '@/components/user/UserAvatar';

interface IUsersTableRow {
  data: UserDto;
}

const UsersTableRow = ({ data }: IUsersTableRow): JSX.Element | null => {
  const history = useHistory();

  if (!data.ethereumAddress) return null;

  const shortEthAddress = shortenEthAddress(data.ethereumAddress);

  return (
    <div
      className="pb-16 sm:pb-4 p-4 gap-y-2 flex flex-wrap justify-between items-center cursor-pointer h-12 rounded-md hover:bg-gray-100"
      onClick={(): void => history.push(`users/${data._id}`)}
    >
      <div className="w-1/2 sm:w-1/3 flex items-center gap-4 text-xs">
        <UserAvatar user={data} />
        <span className=" font-mono text-sm">{shortEthAddress}</span>
      </div>
      <div className="w-1/2 pl-2 sm:w-1/3 sm:pl-0">
        {shortEthAddress !== data.nameRealized ? data.nameRealized : '-'}
      </div>
      <div className="sm:w-1/3">
        {data.roles.map((role, index) => {
          if (role !== UserRole.USER) {
            return <InlineLabel key={`${role}-${index}`} text={role} />;
          }
        })}
      </div>
    </div>
  );
};

export default UsersTableRow;
