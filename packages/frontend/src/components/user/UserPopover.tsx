import React from 'react';
import { Jazzicon } from '@ukstv/jazzicon-react';
import { useHistory } from 'react-router-dom';
import { classNames } from '@/utils/index';
import { UserAvatar } from './UserAvatar';
import { User } from '@/model/user/dto/user.dto';
import { UserAccount } from '@/model/useraccount/dto/user-account.dto';
import { shortenEthAddress } from '@/utils/string';
import { UserAccountPlatformIcon } from './UserAccountPlatformIcon';
import { UserName } from './UserName';
import { useRecoilValue } from 'recoil';
import { SingleUser } from '../../model/user/users';

interface UserPopoverProps {
  user?: User;
  userId?: string | undefined;
  userAccount?: UserAccount;
  children: JSX.Element;
  className?: string;
  usePseudonym?: boolean;
}

const WrappedUserPopover = ({
  user,
  userId,
  userAccount,
  children,
  className,
  usePseudonym = false,
}: UserPopoverProps): JSX.Element | null => {
  const history = useHistory();
  const userFromId = useRecoilValue(SingleUser(userId));
  const [open, setOpen] = React.useState(false);
  const [openTimeout, setOpenTimeout] = React.useState<NodeJS.Timeout | null>(
    null
  );
  const [closeTimeout, setCloseTimeout] = React.useState<NodeJS.Timeout | null>(
    null
  );

  // Merge user and userFromId
  user = user || userFromId;

  // If we have a userAccount, but no user, we can use the user from the userAccount
  if (
    !user &&
    userAccount &&
    userAccount.user &&
    typeof userAccount.user === 'object'
  ) {
    user = userAccount.user as User;
  }

  if (!user && !userAccount) return null;
  if (usePseudonym) return children;

  const handleClick = () => (event: React.MouseEvent<HTMLTableRowElement>) => {
    event.stopPropagation();

    if (user) {
      history.push(`/users/${user._id}`);
      return;
    }
  };

  let userAccounts: UserAccount[] = [];
  if (user && user.accounts) {
    userAccounts = user.accounts as UserAccount[];
  } else if (userAccount) {
    userAccounts = [userAccount];
  }

  return (
    <div className={classNames('inline-block', className)}>
      <div
        onMouseEnter={(): void => {
          closeTimeout && clearTimeout(closeTimeout);
          !open && setOpenTimeout(setTimeout(() => setOpen(true), 500));
        }}
        onMouseLeave={(): void => {
          openTimeout && clearTimeout(openTimeout);
          setCloseTimeout(setTimeout(() => setOpen(false), 300));
        }}
      >
        {children}
      </div>

      {open && (
        <div
          className="absolute z-50 cursor-pointer"
          onClickCapture={handleClick()}
          onMouseOver={(): void => {
            closeTimeout && clearTimeout(closeTimeout);
          }}
          onMouseLeave={(): void => {
            openTimeout && clearTimeout(openTimeout);
            setTimeout(() => setOpen(false), 300);
          }}
        >
          <div className="p-5 text-sm font-normal text-gray-900 border border-solid rounded-lg shadow-md dark:text-white bg-warm-gray-50 dark:bg-slate-900">
            <div className="mb-5 text-4xl">
              <UserAvatar
                user={user}
                userId={userId}
                userAccount={userAccount}
              />
            </div>
            <div className="font-bold">
              <UserName user={user} userId={userId} userAccount={userAccount} />
            </div>
            {userAccounts &&
              userAccounts.map((account) => (
                <div className="flex items-center space-x-2" key={account._id}>
                  <UserAccountPlatformIcon userAccount={account} />
                  <span>{account.name}</span>
                </div>
              ))}

            {typeof user === 'object' && (
              <div className="flex items-center space-x-2">
                <Jazzicon
                  address={user.identityEthAddress}
                  className="w-4 h-4"
                />
                <span>{shortenEthAddress(user.identityEthAddress)}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const UserPopover = React.memo(WrappedUserPopover);
