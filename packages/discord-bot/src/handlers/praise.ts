import {
  ComponentType,
  GuildMember,
  ActionRowBuilder,
  ButtonBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from 'discord.js';
import { parseReceivers } from '../utils/parseReceivers';

import { ephemeralWarning } from '../utils/renderMessage';
import { assertPraiseGiver } from '../utils/assertPraiseGiver';
import { assertPraiseAllowedInChannel } from '../utils/assertPraiseAllowedInChannel';
import { CommandHandler } from '../interfaces/CommandHandler';
import { getUserAccount } from '../utils/getUserAccount';

import { logger } from '../utils/logger';
import { sendActivationMessage } from '../utils/sendActivationMessage';
import { givePraise } from '../utils/givePraise';
import { getSetting } from '../utils/settingsUtil';

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
  if (!responseUrl || !interaction) return;

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
      if (!response) {
        await interaction.editReply("Error: Can't run activation flow");
        return;
      }

      const [message, activationUrl] = response;

      try {
        const collector = message.createMessageComponentCollector({
          filter: (i) =>
            i.user.id === interaction.user.id &&
            (i.customId === 'retry' ||
              i.customId === `activate-${member.user.id}`) &&
            i.isButton(),
          componentType: ComponentType.Button,
          time: 600000,
        });

        collector.on('collect', async (i) => {
          if (i.customId === `activate-${member.user.id}`) {
            const buttonIndex = i.message.components[0].components.findIndex(
              (c) => c.customId === `activate-${member.user.id}`
            );
            const builder = new ActionRowBuilder<ButtonBuilder>();
            ActionRowBuilder.from(i.message.components[0]).components.forEach(
              (i, index) => {
                if (i instanceof ButtonBuilder) {
                  if (index === buttonIndex) i.setDisabled(true);
                  builder.addComponents(i);
                }
              }
            );
            await i.update({
              content: i.message.content,
              components: [builder],
            });
            await i.followUp({
              content: `Open this link and sign a message with your Ethereum wallet to activate: ${activationUrl}`,
              ephemeral: true,
            });
            return;
          }
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
      const directQuantificationEnanbled = (await getSetting(
        'DISCORD_BOT_DIRECT_PRAISE_QUANTIFICATION_ENABLED',
        host
      )) as boolean;

      // If direct quantification is disabled, give praise directly
      // This is the default behavior
      if (!directQuantificationEnanbled) {
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

      // If direct quantification is enabled, allow user to select a score from a dropdown
      const allowedScores = (await getSetting(
        'PRAISE_QUANTIFY_ALLOWED_VALUES',
        host
      )) as number[];

      const select = new StringSelectMenuBuilder()
        .setCustomId('score')
        .setPlaceholder('Select an impact score!')
        .addOptions(
          allowedScores.map((score) =>
            new StringSelectMenuOptionBuilder()
              .setLabel(score.toString())
              .setValue(score.toString())
          )
        );

      const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
        select
      );

      await interaction.followUp({
        content: 'Select an impact score!',
        components: [row],
      });

      const collector = interaction.channel?.createMessageComponentCollector({
        componentType: ComponentType.StringSelect,
        time: 15000,
      });

      collector?.on('collect', async (menuInteraction) => {
        const score = Number(menuInteraction.values[0]);
        logger.debug(`Score selected: ${score}`);
        await givePraise(
          interaction,
          guild,
          member as GuildMember,
          giverAccount,
          parsedReceivers,
          receiverOptions,
          reason,
          host,
          responseUrl,
          score
        );
      });
    }
  } catch (err) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    logger.error(`(praise) ${(err as any).message as string}`);
    throw err;
  }
};
