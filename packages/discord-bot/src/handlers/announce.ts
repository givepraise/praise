import {
  ActionRowBuilder,
  ButtonBuilder,
  StringSelectMenuBuilder,
  GuildMember,
} from 'discord.js';
import { CommandHandler } from '../interfaces/CommandHandler';
import {
  continueButton,
  cancelButton,
} from '../utils/buttons/confirmationButtons';
import { dmTargetMenu } from '../utils/menus/dmTargetmenu';
import { selectTargets } from '../utils/dmTargets';
import { announcementEmbed } from '../utils/embeds/announcementEmbed';
import { periodSelectMenu } from '../utils/menus/periodSelectMenu';
import { getUserAccount } from '../utils/getUserAccount';

import { apiGet } from '../utils/api';
import { PeriodPaginatedResponseDto, Period } from '../utils/api-schema';
import { renderMessage } from '../utils/renderMessage';
import { logger } from '../utils/logger';

/**
 * Executes command /announce
 *  Sends DMs to specified lists of users with a given message
 *
 */
export const announcementHandler: CommandHandler = async (
  client,
  interaction,
  host
) => {
  const { guild, channel, member } = interaction;
  if (!guild || !member || !channel) {
    await interaction.editReply(await renderMessage('DM_ERROR'));
    return;
  }

  const userAccount = await getUserAccount((member as GuildMember).user, host);

  if (!userAccount.user || userAccount === null) {
    await interaction.editReply(
      await renderMessage('PRAISE_ACCOUNT_NOT_ACTIVATED_ERROR', host)
    );
    return;
  }

  const currentUser = userAccount.user;

  if (!currentUser.roles.includes('ADMIN')) {
    await interaction.editReply({
      content:
        'You do not have the needed permissions to use this command. If you would like to perform admin actions, you would need to be granted an `ADMIN` role on the Praise Dashboard.',
    });
    return;
  }

  const message = interaction.options.getString('message', true);

  const userSelectionMsg = await interaction.editReply({
    content: 'Which users do you want to send the message to?',
    components: [
      new ActionRowBuilder<StringSelectMenuBuilder>().addComponents([
        dmTargetMenu,
      ]),
    ],
  });

  const collector = userSelectionMsg.createMessageComponentCollector({
    filter: (click) => click.user.id === interaction.user.id,
    time: 900000,
  });

  let selectedUserType: string;
  let selectedPeriod: string | undefined;

  collector.on('collect', async (click) => {
    await click.deferUpdate();
    switch (click.customId) {
      case 'dm-menu': {
        if (!click.isStringSelectMenu()) break;
        selectedUserType = click.values[0];
        if (
          selectedUserType === 'ASSIGNED-QUANTIFIERS' ||
          selectedUserType === 'UNFINISHED-QUANTIFIERS' ||
          selectedUserType === 'RECEIVERS'
        ) {
          let periods: Period[] = [];

          try {
            const response = await apiGet<PeriodPaginatedResponseDto>(
              'periods',
              {
                headers: { host: host },
              }
            );
            periods = [...response.data.docs];
          } catch (err) {
            logger.error(err);
            await interaction.editReply(
              'No praise periods found. Try again after having created a period and quantified some praise.'
            );
            return;
          }

          const openPeriods = periods.filter(
            (doc) => doc.status === 'QUANTIFY'
          );

          if (!openPeriods || !openPeriods.length) {
            await interaction.editReply({
              content: 'No periods open for quantification.',
              components: [],
            });
            return;
          }

          await interaction.editReply({
            content: 'Which period are you referring to?',
            components: [
              new ActionRowBuilder<StringSelectMenuBuilder>().addComponents([
                periodSelectMenu(openPeriods),
              ]),
            ],
          });
          break;
        }
        selectedPeriod = '';
        await interaction.editReply({
          content: `Preview announcement before continuing:\n---\n${message}\n---`,
          components: [
            new ActionRowBuilder<ButtonBuilder>().addComponents([
              continueButton,
              cancelButton,
            ]),
          ],
        });
        break;
      }
      case 'period-menu': {
        if (!click.isStringSelectMenu()) return;
        selectedPeriod = click.values[0];
        await interaction.editReply({
          content: `Preview announcement before continuing:\n---\n${message}\n---`,
          components: [
            new ActionRowBuilder<ButtonBuilder>().addComponents([
              continueButton,
              cancelButton,
            ]),
          ],
        });
        break;
      }
      case 'continue': {
        await interaction.editReply({
          content: 'Sending…',
          components: [],
        });

        // debug log
        logger.debug(
          `Running /admin announce for users: ${selectedUserType} & period: ${
            selectedPeriod || 'undefined'
          }`
        );

        await selectTargets(
          interaction,
          selectedUserType,
          selectedPeriod,
          announcementEmbed(member.user, guild, message),
          host
        );
        break;
      }
      case 'cancel': {
        await interaction.editReply({
          content: 'User cancelled Interaction.',
          embeds: [],
          components: [],
        });
        return;
      }
    }
  });

  collector.on('end', async (collected) => {
    const successfulEndEvents = ['cancel', 'continue'];
    const ended = collected.some((clk) =>
      successfulEndEvents.includes(clk.customId)
    );
    if (!ended) {
      await interaction.followUp({
        content: 'Interaction timed out...',
        embeds: [],
        components: [],
      });
    }
  });
};
