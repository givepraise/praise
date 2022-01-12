import { User, UserAccountPlatform } from "@/model/users";
import { shortenEthAddress } from ".";

export const getUsername = (user: User): string | undefined => {
  if (!user) return "Unknown User";

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
