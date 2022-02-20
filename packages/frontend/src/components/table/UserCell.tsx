import { SingleUser } from '@/model/users';
import { getUsername } from '@/utils/users';
import { useRecoilValue } from 'recoil';

interface UserCellProps {
  userId: string | undefined;
}

export const UserCell = ({ userId }: UserCellProps) => {
  const user = useRecoilValue(SingleUser({ userId }));
  if (user) return <div>{getUsername(user)}</div>;
  if (!userId) return <div>Unknown user</div>;
  return <div>{userId}</div>;
};
