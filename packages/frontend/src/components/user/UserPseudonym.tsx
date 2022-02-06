import { PseudonymForUser } from '@/model/users';
import { useRecoilValue } from 'recoil';

interface UserPseudonymParams {
  userId: string;
  periodId: string;
}
export const UserPseudonym = ({ userId, periodId }: UserPseudonymParams) => {
  const userPseudonym = useRecoilValue(PseudonymForUser({ userId, periodId }));
  return <>{userPseudonym}</>;
};
