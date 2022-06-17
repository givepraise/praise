import { UserDto } from 'api/dist/user/types';
import { UserAccountDto } from 'api/dist/useraccount/types';
import { UserAvatar } from './UserAvatar';
import { UserName } from './UserName';
import { SingleUser } from '@/model/users';
import { useRecoilValue } from 'recoil';
import { UserPopover } from './UserPopover';
import React from 'react';

interface UserNameProps {
  user?: UserDto;
  userId?: string | undefined;
  userAccount?: UserAccountDto;
  usePseudonym?: boolean;
  periodId?: string;
  avatarClassName?: string;
  nameClassName?: string;
}

export const WrappedUserAvatarAndName = ({
  user,
  userId,
  userAccount,
  usePseudonym = false,
  periodId,
  avatarClassName,
  nameClassName,
}: UserNameProps): JSX.Element | null => {
  const userFromGlobalState = useRecoilValue(SingleUser(userId));

  if ((!user && !userId && !userAccount) || (usePseudonym && !periodId))
    return null;

  const mergedUser = user ? user : userFromGlobalState;

  return (
    <UserPopover userAccount={userAccount} user={mergedUser}>
      <div className="flex whitespace-nowrap">
        <div className={`flex items-center pr-2 ${avatarClassName}`}>
          <UserAvatar
            user={mergedUser}
            userAccount={userAccount}
            usePseudonym={usePseudonym}
          />
        </div>
        <div className={`flex items-center ${nameClassName}`}>
          <UserName
            user={mergedUser}
            userAccount={userAccount}
            usePseudonym={usePseudonym}
            periodId={periodId}
          />
        </div>
      </div>
    </UserPopover>
  );
};

export const UserAvatarAndName = React.memo(WrappedUserAvatarAndName);
