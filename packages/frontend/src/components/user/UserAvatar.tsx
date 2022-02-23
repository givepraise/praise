import { SingleBooleanSetting } from '@/model/settings';
import { faUserCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { UserDto } from 'api/dist/user/types';
import { UserAccountDto } from 'api/dist/useraccount/types';
import React from 'react';
import { useRecoilValue } from 'recoil';

const discordAvatarUrl = (account: UserAccountDto) => {
  return `https://cdn.discordapp.com/avatars/${account.accountId}/${account.avatarId}.webp?size=128`;
};

interface UserAvatarProps {
  user?: UserDto;
  userAccount?: UserAccountDto;
  enablePseudomyms?: boolean;
}
const WrappedUserAvatar = ({
  user,
  userAccount,
  enablePseudomyms,
}: UserAvatarProps): JSX.Element => {
  const pseudonymSetting = useRecoilValue(
    SingleBooleanSetting('PRAISE_QUANTIFY_RECEIVER_PSEUDONYMS')
  );
  if (enablePseudomyms && pseudonymSetting)
    return <FontAwesomeIcon icon={faUserCircle} size="2x" />;
  let url;
  if (user) {
    if (Array.isArray(user.accounts) && user.accounts.length > 0) {
      for (const account of user.accounts) {
        // Prefer DISCORD over others
        if (account.avatarId && account.platform === 'DISCORD') {
          url = discordAvatarUrl(account);
          break;
        }
      }
    }
  }
  if (userAccount) {
    if (userAccount.avatarId && userAccount.platform === 'DISCORD') {
      url = discordAvatarUrl(userAccount);
    }
  }

  return url ? (
    <img src={url} alt="avatar" className="rounded-full w-[29px] max-w-none" />
  ) : (
    <FontAwesomeIcon icon={faUserCircle} size="2x" />
  );
};

export const UserAvatar = React.memo(WrappedUserAvatar);
