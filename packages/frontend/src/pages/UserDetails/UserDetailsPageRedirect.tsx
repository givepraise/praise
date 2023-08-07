import { useRecoilValue } from 'recoil';
import { Redirect, useParams } from 'react-router-dom';
import {
  SingleUser,
  SingleUserParams,
  useLoadSingleUserDetails,
} from '@/model/user/users';

const UserDetailsPageRedirect = (): JSX.Element | null => {
  const { userId } = useParams<SingleUserParams>();

  useLoadSingleUserDetails(userId);
  const user = useRecoilValue(SingleUser(userId));

  if (!user) return null;

  return <Redirect to={`/${user.username}`} />;
};

export default UserDetailsPageRedirect;
