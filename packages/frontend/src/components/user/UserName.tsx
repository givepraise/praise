import React from 'react';
import { UserPseudonym } from './UserPseudonym';
import { UserDto } from '@/model/user/dto/user.dto';
import { UserAccountDto } from '@/model/useraccount/useraccount.dto';
import { shortenEthAddress } from 'shared/functions/shortenEthAddress';

interface UserNameProps {
  user?: UserDto;
  userAccount?: UserAccountDto;
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

  if (localUser) {
    if (usePseudonym && periodId) {
      name = <UserPseudonym userId={localUser._id} periodId={periodId} />;
    } else {
      name =
        localUser.username.length === 42 && localUser.username.startsWith('0x')
          ? shortenEthAddress(localUser.username)
          : localUser.username;
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
