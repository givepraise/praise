import { UserModel } from 'api/dist/user/entities';
import { UserAccountModel } from 'api/dist/useraccount/entities';
import { CommandInteraction, GuildMember } from 'discord.js';
import { UserState } from '../interfaces/UserState';
import { getSetting } from '../utils/getSettings';
import { getUserAccount } from '../utils/getUserAccount';
import { getStateEmbed } from '../utils/stateEmbed';

export const whoamiHandler = async (
  interaction: CommandInteraction
): Promise<void> => {
  const { member, guild } = interaction;
  if (!member || !guild) return;

  const ua = await getUserAccount(member as GuildMember);

  const state: UserState = {
    id: ua.accountId,
    username: ua.name,
    hasPraiseGiverRole: false,
    activated: !ua.user ? false : true,
  };

  const praiseGiverRoleID = await getSetting('PRAISE_GIVER_ROLE_ID');
  const praiseGiverRole = guild.roles.cache.find(
    (r) => r.id === praiseGiverRoleID
  );
  const updatedMember = await guild.members.fetch(member.user.id);

  if (
    praiseGiverRole &&
    updatedMember.roles.cache.find((r) => r.id === praiseGiverRole?.id)
  ) {
    state.hasPraiseGiverRole = true;
  }

  const User = await UserModel.findOne({ _id: ua.user });
  state.praiseRoles = User?.roles || [];
  state.address = User?.ethereumAddress || '';
  state.avatar = ua.avatarId;

  const activatedAccounts = await UserAccountModel.find({ user: ua.user });
  if (activatedAccounts) {
    state.activations = [];
    for (const account of activatedAccounts) {
      state.activations?.push({
        platform: account.platform,
        user: account.name,
        activationDate: account.createdAt,
        latestUsageDate: account.updatedAt,
      });
    }
  }

  await interaction.editReply({
    embeds: [getStateEmbed(state)],
  });
  return;
};
