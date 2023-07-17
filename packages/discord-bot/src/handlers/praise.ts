import { ComponentType, GuildMember } from 'discord.js';
import { parseReceivers } from '../utils/parseReceivers';

import { ephemeralWarning } from '../utils/renderMessage';
import { assertPraiseGiver } from '../utils/assertPraiseGiver';
import { assertPraiseAllowedInChannel } from '../utils/assertPraiseAllowedInChannel';
import { CommandHandler } from '../interfaces/CommandHandler';
import { getUserAccount } from '../utils/getUserAccount';

import { logger } from '../utils/logger';
import { sendActivationMessage } from '../utils/sendActivationMessage';
import { givePraise } from '../utils/givePraise';

/**
 * Execute command /praise
 *  Creates praises with a given receiver and reason
 *  with the command executor as the praise.giver
 *
 */
export const praiseHandler: CommandHandler = async (
  client,
  interaction,
  host,
  responseUrl
) => {
  if (!responseUrl) return;

  const { guild, member } = interaction;

  if (!guild || !member) {
    await ephemeralWarning(interaction, 'DM_ERROR');
    return;
  }

  try {
    if (
      !(await assertPraiseGiver(member as GuildMember, interaction, true, host))
    )
      return;
    if (!(await assertPraiseAllowedInChannel(interaction, host))) return;

    const receiverOptions = interaction.options.getString('receivers');

    if (!receiverOptions || receiverOptions.length === 0) {
      await ephemeralWarning(
        interaction,
        'PRAISE_INVALID_RECEIVERS_ERROR',
        host
      );
      return;
    }

    const reason = interaction.options.getString('reason', true);

    if (reason.length < 5 || reason.length > 500) {
      await ephemeralWarning(interaction, 'INVALID_REASON_LENGTH', host);
      return;
    }

    const parsedReceivers = parseReceivers(receiverOptions);

    if (
      !parsedReceivers.validReceiverIds ||
      parsedReceivers.validReceiverIds?.length === 0
    ) {
      await ephemeralWarning(
        interaction,
        'PRAISE_INVALID_RECEIVERS_ERROR',
        host
      );
      return;
    }

    let giverAccount = await getUserAccount((member as GuildMember).user, host);

    if (!giverAccount || !giverAccount.user || giverAccount.user === null) {
      const response = await sendActivationMessage(
        interaction,
        host,
        member,
        true
      );
      if (!response) return;

      try {
        const collector = response.createMessageComponentCollector({
          filter: (i) =>
            i.user.id === interaction.user.id && i.customId === 'retry',
          componentType: ComponentType.Button,
          time: 600000,
        });

        collector.on('collect', async (i) => {
          giverAccount = await getUserAccount(
            (member as GuildMember).user,
            host
          );

          if (giverAccount && giverAccount.user) {
            collector.stop();
            await givePraise(
              interaction,
              guild,
              member as GuildMember,
              giverAccount,
              parsedReceivers,
              receiverOptions,
              reason,
              host,
              responseUrl
            );
            return;
          }

          await i.update({
            content:
              i.message.content +
              '\nRetry failed... Retry praise after activating on the Praise dashboard',
          });
        });
      } catch {
        await interaction.editReply(
          'Timed out... Please use /praise command again.'
        );
      }
    } else {
      await givePraise(
        interaction,
        guild,
        member as GuildMember,
        giverAccount,
        parsedReceivers,
        receiverOptions,
        reason,
        host,
        responseUrl
      );
    }
  } catch (err) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    logger.error(`(praise) ${(err as any).message as string}`);
    throw err;
  }
};
