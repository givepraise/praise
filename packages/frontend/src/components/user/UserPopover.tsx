import React from 'react';
import { shortenEthAddress } from 'api/dist/user/utils/core';
import { Jazzicon } from '@ukstv/jazzicon-react';
import { faDiscord } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useHistory } from 'react-router-dom';
import { classNames } from '@/utils/index';
import { UserAvatar } from './UserAvatar';
import { UserDto } from '@/model/user/user.dto';
import { UserAccountDto } from '@/model/useraccount/useraccount.dto';

interface UserPopoverProps {
  user?: UserDto;
  userAccount?: UserAccountDto;
  children: JSX.Element;
  className?: string;
  usePseudonym?: boolean;
}

const WrappedUserPopover = ({
  user,
  userAccount,
  children,
  className,
  usePseudonym = false,
}: UserPopoverProps): JSX.Element | null => {
  const history = useHistory();
  const [open, setOpen] = React.useState(false);
  const [openTimeout, setOpenTimeout] = React.useState<NodeJS.Timeout | null>(
    null
  );
  const [closeTimeout, setCloseTimeout] = React.useState<NodeJS.Timeout | null>(
    null
  );

  if (!user && !userAccount) return null;

  if (usePseudonym) return children;

  const localUser =
    user ||
    (typeof userAccount?.user === 'object' ? userAccount?.user : undefined);

  let discordUsername: string | undefined;
  let identityEthAddress: string | undefined;

  if (localUser) {
    discordUsername = localUser.accounts?.find(
      (account) => account.platform === 'DISCORD'
    )?.name;
    identityEthAddress = localUser.identityEthAddress;
  }

  if (userAccount && userAccount.platform === 'DISCORD') {
    discordUsername = userAccount.name;
  }

  const handleClick =
    (userAccount: UserAccountDto | undefined) =>
    (event: React.MouseEvent<HTMLTableRowElement>) => {
      event.stopPropagation();

      if (user) {
        history.push(`/users/${user._id}`);
        return;
      }

      if (userAccount && userAccount.user) {
        history.push(`/users/${userAccount.user}`);
      }
    };

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
          className="absolute z-10 cursor-pointer"
          onClickCapture={handleClick(userAccount)}
          onMouseOver={(): void => {
            closeTimeout && clearTimeout(closeTimeout);
          }}
          onMouseLeave={(): void => {
            openTimeout && clearTimeout(openTimeout);
            setTimeout(() => setOpen(false), 300);
          }}
        >
          <div className="p-5 text-sm text-gray-900 border border-solid rounded-lg shadow-md dark:text-white bg-warm-gray-50 dark:bg-slate-900">
            <div className="mb-5 text-4xl">
              <UserAvatar user={user} userAccount={userAccount} />
            </div>
            {discordUsername && (
              <div className="flex items-center space-x-2">
                <FontAwesomeIcon icon={faDiscord} size="1x" />
                <span>{discordUsername}</span>
              </div>
            )}
            {identityEthAddress && (
              <div className="flex items-center mt-3 space-x-2">
                <Jazzicon address={identityEthAddress} className="w-4 h-4" />
                <span>{shortenEthAddress(identityEthAddress)}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const UserPopover = React.memo(WrappedUserPopover);
