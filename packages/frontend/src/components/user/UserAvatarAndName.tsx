import { useRecoilValue } from 'recoil';
import React from 'react';
import { SingleUser } from '@/model/user/users';
import { classNames } from '@/utils/index';
import { UserAvatar } from './UserAvatar';
import { UserName } from './UserName';
import { UserPopover } from './UserPopover';
import { UserDto } from '@/model/user/dto/user.dto';
import { UserAccountDto } from '@/model/useraccount/useraccount.dto';

interface UserNameProps {
  user?: UserDto;
  userId?: string | undefined;
  userAccount?: UserAccountDto;
  usePseudonym?: boolean;
  periodId?: string;
  avatarClassName?: string;
  nameClassName?: string;
}

const WrappedUserAvatarAndName = ({
  user,
  userId,
  userAccount,
  usePseudonym = false,
  periodId,
  avatarClassName,
  nameClassName,
}: UserNameProps): JSX.Element | null => {
  const mergedUserId =
    userAccount?.user && typeof userAccount.user === 'string'
      ? userAccount.user
      : userId;

  const userFromGlobalState = useRecoilValue(SingleUser(mergedUserId));

  if ((!user && !userId && !userAccount) || (usePseudonym && !periodId))
    return null;

  const mergedUser = user ? user : userFromGlobalState;

  return (
    <UserPopover
      usePseudonym={usePseudonym}
      userAccount={userAccount}
      user={mergedUser}
    >
      <div className="flex whitespace-nowrap">
        <div className={classNames('flex items-center pr-2', avatarClassName)}>
          <UserAvatar
            user={mergedUser}
            userAccount={userAccount}
            usePseudonym={usePseudonym}
          />
        </div>
        <div className={classNames('flex items-center', nameClassName)}>
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
