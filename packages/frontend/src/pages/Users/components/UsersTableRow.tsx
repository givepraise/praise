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
      className="flex items-center w-full p-3 cursor-pointer hover:bg-gray-100"
      onClick={(): void => history.push(`users/${data._id}`)}
    >
      <div className="flex items-center w-full ">
        <div className="flex items-center w-1/3">
          <div className="pr-3">
            <UserAvatar user={data} />
          </div>
          <div className="">
            <span className="font-mono text-sm ">{shortEthAddress}</span>
          </div>
        </div>
        <div className="w-1/3 pl-2 sm:pl-0">
          {shortEthAddress !== data.nameRealized ? data.nameRealized : '-'}
        </div>
        <div className="w-1/3">
          {data.roles.map((role, index) => {
            if (role !== UserRole.USER) {
              return <InlineLabel key={`${role}-${index}`} text={role} />;
            }
          })}
        </div>
      </div>
    </div>
  );
};

export default UsersTableRow;
