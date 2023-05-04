import { useRecoilValue } from 'recoil';
import React from 'react';
import { PseudonymForUser } from '@/model/user/users';
interface UserPseudonymParams {
  userId: string | undefined;
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
