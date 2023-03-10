import { CacheType, CommandInteraction, GuildMember, Role } from 'discord.js';
import { settingValue } from 'api/dist/shared/settings';
import { dmError, praiseRoleError } from './embeds/praiseEmbeds';
import { apiClient } from './api';
import { Setting } from './api-schema';
/**
 * Check if user has discord role PRAISE_GIVER_ROLE_ID if required,
 *  if not: reply with an error message
 *
 * @param {GuildMember} praiseGiver
 * @param {CommandInteraction<CacheType>} interaction
 * @param {boolean} sendReply
 * @returns {Promise<boolean>}
 */
export const assertPraiseGiver = async (
  praiseGiver: GuildMember,
  interaction: CommandInteraction<CacheType>,
  sendReply: boolean
): Promise<boolean> => {
  const praiseGiverRoleIDRequired = await apiClient(
    '/settings?key=PRAISE_GIVER_ROLE_ID_REQUIRED'
  )
    .then((res) => (res.data as Setting).value == 'true')
    .catch(() => false);

  const praiseGiverRoleIDList = await apiClient(
    '/settings?key=PRAISE_GIVER_ROLE_ID'
  )
    .then((res) => (res.data as Setting).value.split(','))
    .catch(() => null);

  if (!praiseGiverRoleIDRequired) {
    return true;
  }

  // Assert that a Praise Giver Role ID has been specified
  if (
    !praiseGiverRoleIDList ||
    (praiseGiverRoleIDList.length === 1 &&
      (!praiseGiverRoleIDList[0] || praiseGiverRoleIDList[0] === '0'))
  ) {
    if (sendReply) {
      await interaction.editReply({
        content: '**❌ No Praise Giver Discord Role ID specified.**',
      });
    }
    return false;
  }

  const { guild } = interaction;
  if (!guild) {
    if (sendReply) {
      await interaction.editReply({
        content: await dmError(),
      });
    }
    return false;
  }

  // Assert that the all praise giver roles exist
  const roles: Role[] = [];
  let invalidRole = '';
  for (const roleID of praiseGiverRoleIDList) {
    const guildRole = guild.roles.cache.find((r) => r.id === roleID);
    if (!guildRole) {
      invalidRole = roleID;
      break;
    } else {
      roles.push(guildRole);
    }
  }

  if (invalidRole) {
    if (sendReply) {
      await interaction.editReply({
        content: `**❌ Unknown Praise Giver Discord Role ID: "${invalidRole}".**`,
      });
    }
    return false;
  }

  let isPraiseGiver = false;
  for (const roleID of praiseGiverRoleIDList) {
    if (praiseGiver.roles.cache.find((r) => r.id === roleID)) {
      isPraiseGiver = true;
      break;
    }
  }

  if (!isPraiseGiver) {
    if (sendReply) {
      await interaction.editReply({
        embeds: [await praiseRoleError(roles, praiseGiver.user)],
      });
    }
    return false;
  }

  return true;
};
