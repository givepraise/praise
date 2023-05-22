import React from 'react';
import { UserPseudonym } from './UserPseudonym';
import { User } from '@/model/user/dto/user.dto';
import { UserAccount } from '@/model/useraccount/dto/user-account.dto';
import { shortenEthAddress } from '../../utils/string';
import { useRecoilValue } from 'recoil';
import { SingleUser } from '../../model/user/users';

interface UserNameProps {
  user?: User;
  userId?: string | undefined;
  userAccount?: UserAccount;
  usePseudonym?: boolean;
  periodId?: string;
  className?: string;
}

const WrappedUserName = ({
  user,
  userId,
  userAccount,
  usePseudonym = false,
  periodId,
  className,
}: UserNameProps): JSX.Element => {
  const userFromId = useRecoilValue(SingleUser(userId));

  // If we have a userAccount, but no user, we can use the user from the userAccount
  if (!user && userAccount && userAccount.user) {
    if (typeof userAccount.user === 'object') {
      user = userAccount.user as User;
    } else {
      userId = userAccount.user as string;
    }
  }

  // Merge user and userFromId
  user = user || userFromId;

  let name = 'Unknown username';

  if (usePseudonym) {
    if (!userAccount || !periodId) {
      return <div className={className}>{name}</div>;
    }
    return <UserPseudonym userId={userAccount?._id} periodId={periodId} />;
  }

  if (userAccount && userAccount.name) {
    name = userAccount.name;
  }

  if (user && user.username) {
    name = user.username;
  }

  if (name.length === 42) {
    name = shortenEthAddress(name);
  }
  if (name.length > 20) {
    name = name.substring(0, 20) + '...';
  }

  return <div className={className}>{name}</div>;
};

export const UserName = React.memo(WrappedUserName);
