import { MessageEmbed, StringMappedInteractionTypes } from 'discord.js';
import { UserState } from '../interfaces/UserState';

const formatDate = (date: Date): string =>
  `${date.getDate()}-${date.getMonth()}-${date.getFullYear()}`;

export const getStateEmbed = (state: UserState): MessageEmbed => {
  const embed = new MessageEmbed()
    .setTitle(state.username)
    .setDescription(
      state.hasPraiseGiverRole && state.activated
        ? 'Your account is activated and has praise powers.'
        : state.hasPraiseGiverRole
        ? "You have praise powers, however your account isn't activated(use `/activate` command)."
        : "Your account is activated, however you don't have praise powers."
    )
    .setThumbnail(
      `https://cdn.discordapp.com/avatars/${state.id}/${state.avatar || 'oops'}`
    );
  if (state.activated) {
    embed.addField('User Roles', state.praiseRoles?.join(' | ') || 'oops');
    embed.addField('Ethereum Address', state.address || 'oops');
    embed.addField(
      'Activations',
      state.activations
        ?.map(
          (account) =>
            `> ${account.platform}\n> Account: ${
              account.user
            }\n> Date of Activation: ${formatDate(
              account.activationDate
            )}\n> Last Active: ${formatDate(account.latestUsageDate)}`
        )
        .join('\n\n') || 'oops'
    );
  }

  return embed;
};
