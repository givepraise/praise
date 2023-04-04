import React from 'react';
import { UserPseudonym } from './UserPseudonym';
import { User } from '@/model/user/dto/user.dto';
import { UserAccount } from '@/model/useraccount/dto/user-account.dto';
import { shortenEthAddress } from '@/utils/string';

interface UserNameProps {
  user?: User;
  userAccount?: UserAccount;
  usePseudonym?: boolean;
  periodId?: string;
  className?: string;
}

const WrappedUserName = ({
  user,
  userAccount,
  usePseudonym = false,
  periodId,
  className,
}: UserNameProps): JSX.Element => {
  let name;

  if ((!user && !userAccount) || (usePseudonym && !periodId))
    name = 'Unknown username';

  const localUser =
    user ||
    (typeof userAccount?.user === 'object' ? userAccount?.user : undefined);

  if (localUser?.username) {
    if (usePseudonym && periodId) {
      name = <UserPseudonym userId={localUser._id} periodId={periodId} />;
    } else {
      name = localUser.username;
    }
  } else {
    if (userAccount) {
      if (usePseudonym && periodId) {
        name = <UserPseudonym userId={userAccount._id} periodId={periodId} />;
      } else {
        name = userAccount.name;
      }
    }
  }

  return <div className={className}>{name}</div>;
};

export const UserName = React.memo(WrappedUserName);
