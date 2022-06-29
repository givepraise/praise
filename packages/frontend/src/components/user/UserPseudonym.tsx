import { PseudonymForUser } from '@/model/users';
import { useRecoilValue } from 'recoil';
import React from 'react';
interface UserPseudonymParams {
  userId: string;
  periodId: string;
}
const WrappedUserPseudonym = ({
  userId,
  periodId,
}: UserPseudonymParams): JSX.Element => {
  const userPseudonym = useRecoilValue(PseudonymForUser({ userId, periodId }));
  return <>{userPseudonym}</>;
};

export const UserPseudonym = React.memo(WrappedUserPseudonym);
