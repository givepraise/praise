import { UserDto } from 'api/dist/user/types';
import { UserAccountDto } from 'api/dist/useraccount/types';
import React from 'react';

import { UserPseudonym } from './UserPseudonym';

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

  if (user) {
    if (usePseudonym && periodId) {
      name = <UserPseudonym userId={user._id} periodId={periodId} />;
    } else {
      name = user.nameRealized;
    }
  } else {
    if (userAccount) {
      if (usePseudonym && periodId) {
        name = <UserPseudonym userId={userAccount._id} periodId={periodId} />;
      } else {
        name = userAccount.nameRealized;
      }
    }
  }

  return <div className={className}>{name}</div>;
};

export const UserName = React.memo(WrappedUserName);
