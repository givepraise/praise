import { SingleBooleanSetting } from "@/model/settings";
import { User, UserAccount, UserAccountPlatform } from "@/model/users";
import { faUserCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { useRecoilValue } from "recoil";

const discordAvatarUrl = (account: UserAccount) => {
  return `https://cdn.discordapp.com/avatars/${account.id}/${account.profileImageUrl}.webp?size=128`;
};

interface UserAvatarProps {
  user?: User;
  userAccount?: UserAccount;
}
const WrappedUserAvatar = ({ user, userAccount }: UserAvatarProps) => {
  const usePseudonyms = useRecoilValue(
    SingleBooleanSetting("PRAISE_QUANTIFY_RECEIVER_PSEUDONYMS")
  );
  if (usePseudonyms) return <FontAwesomeIcon icon={faUserCircle} size="2x" />;
  let url;
  if (user) {
    if (Array.isArray(user.accounts) && user.accounts.length > 0) {
      for (const account of user.accounts) {
        // Prefer DISCORD over others
        if (
          account.profileImageUrl &&
          account.platform === UserAccountPlatform.DISCORD
        ) {
          url = discordAvatarUrl(account);
          break;
        }
      }
    }
  }
  if (userAccount) {
    if (
      userAccount.profileImageUrl &&
      userAccount.platform === UserAccountPlatform.DISCORD
    ) {
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
