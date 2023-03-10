import { ChatInputCommandInteraction, GuildMember } from 'discord.js';
import { UserState } from '../interfaces/UserState';
import { getUserAccount } from '../utils/getUserAccount';
import { getStateEmbed } from '../utils/embeds/stateEmbed';
import { assertPraiseGiver } from '../utils/assertPraiseGiver';
import { dmError } from '../utils/embeds/praiseEmbeds';
import { getUser } from 'src/utils/getUser';
import { apiClient } from 'src/utils/api';
import { UserAccount } from 'src/utils/api-schema';
/**
 * Execute command /whoami
 *  Gives the user information about their account and activation status
 *
 * @param {CommandInteraction} interaction
 * @returns {Promise<void>}
 */
export const whoamiHandler = async (
  interaction: ChatInputCommandInteraction
): Promise<void> => {
  const { member, guild } = interaction;
  if (!guild || !member) {
    await interaction.editReply(await dmError());
    return;
  }

  const ua = await getUserAccount(member as GuildMember);

  const state: UserState = {
    id: ua.accountId,
    username: ua.name,
    hasPraiseGiverRole: false,
    activated: !ua.user ? false : true,
  };

  state.hasPraiseGiverRole = await assertPraiseGiver(
    member as GuildMember,
    interaction,
    false
  );

  const User = await getUser(ua.user);
  state.praiseRoles = User?.roles || '';
  state.address = User?.identityEthAddress || '';
  state.avatar = ua.avatarId;

  // const activatedAccount: UserAccount = await apiClient(
  //   `useraccounts?_id=${ua.user}`
  // ).then((res) => res.data);
  // if (activatedAccount) {
  //   state.activations = [];
  //   state.activations.push({
  //     platform: activatedAccount.platform,
  //     user: activatedAccount.name,
  //     activationDate: activatedAccount.createdAt,
  //     latestUsageDate: activatedAccount.updatedAt,
  //   });
  // }

  // await interaction.editReply({
  //   embeds: [getStateEmbed(state)],
  // });
  await interaction.editReply('...');
};
