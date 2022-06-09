import { UserAccountModel } from 'api/dist/useraccount/entities';
import { UserAccount, UserAccountDocument } from 'shared/dist/useraccount/types';
import { GuildMember } from 'discord.js';
export const getUserAccount = async (
  member: GuildMember
): Promise<UserAccountDocument> => {
  const ua = {
    accountId: member.user.id,
    name: member.user.username + '#' + member.user.discriminator,
    avatarId: member.user.avatar,
    platform: 'DISCORD',
  } as UserAccount;

  const userAccount = await UserAccountModel.findOneAndUpdate(
    { accountId: ua.accountId },
    ua,
    { upsert: true, new: true }
  );
  return userAccount;
};
