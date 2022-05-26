import { SingleUser } from '@/model/users';
import { useRecoilValue } from 'recoil';

interface UserCellProps {
  userId: string | undefined;
}

export const UserCell = ({ userId }: UserCellProps): JSX.Element | null => {
  const user = useRecoilValue(SingleUser(userId));
  if (!user) return null;

  return <div>{user.nameRealized}</div>;
};
