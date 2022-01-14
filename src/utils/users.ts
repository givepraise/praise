import { User, UserAccountPlatform } from "@/model/users";
import { shortenEthAddress } from ".";

export const getUsername = (user: User): string | undefined => {
  let username = "";
  if (Array.isArray(user.accounts) && user.accounts.length > 0) {
    for (const account of user.accounts) {
      username = account.username;
      // Prefer DISCORD over others
      if (account.platform === UserAccountPlatform.DISCORD) break;
    }
  } else if (username === "")
    return shortenEthAddress(user.ethereumAddress)?.toString();
  return username;
};

export const getProfileImageUrl = (
  user: User,
  size: number
): string | undefined => {
  let url;
  if (Array.isArray(user.accounts) && user.accounts.length > 0) {
    for (const account of user.accounts) {
      // Prefer DISCORD over others
      if (account.platform === UserAccountPlatform.DISCORD) {
        url = `https://cdn.discordapp.com/avatars/${account.id}/${account.profileImageUrl}.webp?size=${size}`;
        break;
      }
    }
  }
  return url;
};
