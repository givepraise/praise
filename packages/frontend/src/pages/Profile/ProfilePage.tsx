import { useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { PublicProfileParams, SingleUserByUsername } from '@/model/users';

export const ProfilePage = () => {
  const { username } = useParams<PublicProfileParams>();

  return (
    <div>
      <h1>Profile Page</h1>
    </div>
  );
};
