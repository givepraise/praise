import { UserDto } from 'api/dist/user/types';
import { UserAccountDto } from 'api/dist/useraccount/types';
import React from 'react';
import { UserPseudonym } from './UserPseudonym';

const nameFromUser = (user: UserDto): string => {
  if (Array.isArray(user.accounts) && user.accounts.length > 0) {
    const discord = user.accounts.find(
      (account) => account.platform === 'DISCORD'
    );
    if (discord) return discord.name.split('#')[0];

    const telegram = user.accounts.find(
      (account) => account.platform === 'TELEGRAM'
    );
    if (telegram) return telegram.name;
  }
  return 'Unknown username';
};

const nameFromUserAccount = (userAccount: UserAccountDto): string => {
  if (userAccount.platform === 'DISCORD') return userAccount.name.split('#')[0];
  return userAccount.name;
};

interface UserNameProps {
  user?: UserDto;
  userAccount?: UserAccountDto;
  usePseudonym?: boolean;
  periodId?: string;
  className?: string;
}

export const WrappedUserName = ({
  user,
  userAccount,
  usePseudonym = false,
  periodId,
  className,
}: UserNameProps): JSX.Element => {
  let name;

  if ((!user && !userAccount) || (usePseudonym && !periodId))
    name = 'Unknown username';

  console.log(user);
  console.log(userAccount);

  if (user) {
    if (usePseudonym && periodId) {
      name = <UserPseudonym userId={user._id} periodId={periodId} />;
    } else {
      name = nameFromUser(user);
    }
  } else {
    if (userAccount) {
      if (usePseudonym && periodId) {
        name = <UserPseudonym userId={userAccount._id} periodId={periodId} />;
      } else {
        name = nameFromUserAccount(userAccount);
      }
    }
  }

  return <div className={className}>{name}</div>;
};

export const UserName = React.memo(WrappedUserName);
