import { useHistory } from 'react-router-dom';
import { UserDto, UserRole } from 'api/dist/user/types';
import { InlineLabel } from '@/components/InlineLabel';
import { UserAvatarAndName } from '@/components/user/UserAvatarAndName';

interface IUsersTableRow {
  data: UserDto;
}

const UsersTableRow = ({ data }: IUsersTableRow): JSX.Element | null => {
  const history = useHistory();

  if (!data.ethereumAddress) return null;

  return (
    <div
      className="flex items-center w-full px-5 py-3 cursor-pointer hover:bg-warm-gray-100 dark:hover:bg-slate-500"
      onClickCapture={(): void => history.push(`users/${data._id}`)}
    >
      <div className="flex items-center w-full ">
        <div className="flex items-center w-1/2 pr-3">
          <UserAvatarAndName user={data} avatarClassName="text-2xl" />
        </div>
        <div className="w-1/2">
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
