import { CacheType, CommandInteraction, GuildMember } from 'discord.js';
import { settingValue } from 'api/dist/shared/settings';
import { dmError, praiseRoleError } from './embeds/praiseEmbeds';

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
  const praiseGiverRoleIDRequired = (await settingValue(
    'PRAISE_GIVER_ROLE_ID_REQUIRED'
  )) as boolean;
  const praiseGiverRoleID = (await settingValue(
    'PRAISE_GIVER_ROLE_ID'
  )) as string;

  if (!praiseGiverRoleIDRequired) {
    return true;
  }

  if (praiseGiverRoleID === '0') {
    sendReply &&
      (await interaction.editReply(
        '**❌ No Praise Giver Discord Role ID specified.**'
      ));
    return false;
  }

  const { guild } = interaction;
  if (!guild) {
    sendReply && (await interaction.editReply(await dmError()));
    return false;
  }

  const praiseGiverRole = guild.roles.cache.find(
    (r) => r.id === praiseGiverRoleID
  );
  if (!praiseGiverRole) {
    sendReply &&
      (await interaction.editReply(
        '**❌ Unknown Praise Giver Discord Role ID.**'
      ));
    return false;
  }

  if (!praiseGiver.roles.cache.find((r) => r.id === praiseGiverRole.id)) {
    sendReply &&
      (await interaction.editReply({
        embeds: [await praiseRoleError(praiseGiverRole, praiseGiver.user)],
      }));
    return false;
  }

  return true;
};
