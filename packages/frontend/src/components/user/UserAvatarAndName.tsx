import { SingleUser } from '@/model/users';
import { useRecoilValue } from 'recoil';
import { UserAvatar } from './UserAvatar';
import { UserPopover } from './UserPopover';

interface UserNameProps {
  userId: string | undefined;
}

export const UserAvatarAndName = ({
  userId,
}: UserNameProps): JSX.Element | null => {
  const user = useRecoilValue(SingleUser(userId));
  if (!user) return null;

  return (
    <UserPopover user={user}>
      <div className="flex items-center space-x-2">
        <UserAvatar user={user} /> <div>{user.nameRealized}</div>
      </div>
    </UserPopover>
  );
};
