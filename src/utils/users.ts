import { User, UserAccountPlatform } from "@/model/users";
import { shortenEthAddress } from ".";

export const getUsername = (user: User): string | undefined => {
  if (!user || !Array.isArray(user.accounts) || user.accounts.length === 0)
    return undefined;

  let username = "";
  for (const account of user.accounts) {
    username = account.username;
    // Prefer DISCORD over others
    if (account.platform === UserAccountPlatform.DISCORD) break;
  }
  const eth = shortenEthAddress(user.ethereumAddress);
  if (username === "" && eth) return eth;
  return username;
};
