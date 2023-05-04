import React from 'react';
import { classNames } from '@/utils/index';
import { UserAvatar } from './UserAvatar';
import { UserName } from './UserName';
import { UserPopover } from './UserPopover';
import { User } from '@/model/user/dto/user.dto';
import { UserAccount } from '@/model/useraccount/dto/user-account.dto';

interface UserNameProps {
  user?: User;
  userId?: string | undefined;
  userAccount?: UserAccount;
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
  if ((!user && !userId && !userAccount) || (usePseudonym && !periodId))
    return null;

  return (
    <UserPopover
      usePseudonym={usePseudonym}
      userAccount={userAccount}
      user={user}
      userId={userId}
    >
      <div className="flex whitespace-nowrap">
        <div className={classNames('flex items-center pr-2', avatarClassName)}>
          <UserAvatar
            user={user}
            userId={userId}
            userAccount={userAccount}
            usePseudonym={usePseudonym}
          />
        </div>
        <div className={classNames('flex items-center', nameClassName)}>
          <UserName
            user={user}
            userId={userId}
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
