import { UserDto } from 'api/dist/user/types';
import { UserAccountDto } from 'api/dist/useraccount/types';
import React from 'react';

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
}

export const WrappedUserName = ({
  user,
  userAccount,
  usePseudonym,
}: UserNameProps): JSX.Element => {
  if (!user && !userAccount) return <div>Unknown username</div>;
  if (user) return <div>{nameFromUser(user)}</div>;
  if (userAccount) return <div>{nameFromUserAccount(userAccount)}</div>;
  return <div>Unknown username'</div>;
};

export const UserName = React.memo(WrappedUserName);
