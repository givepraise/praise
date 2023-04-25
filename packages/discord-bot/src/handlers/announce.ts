import {
  StringSelectMenuInteraction,
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
import { periodSelectMenu } from '../utils/menus/periodSelectMenu';
import { getHost } from '../utils/getHost';
import { getUserAccount } from '../utils/getUserAccount';
import { renderMessage } from '../utils/embeds/praiseEmbeds';
import { apiClient } from '../utils/api';
import { PeriodPaginatedResponseDto } from '../utils/api-schema';

// /**
//  * Executes command /announce
//  *  Sends DMs to specified lists of users with a given message
//  *
//  * @param  interaction
//  * @returns
//  */
export const announcementHandler: CommandHandler = async (
  client,
  interaction
) => {
  const { guild, channel, member } = interaction;
  if (!guild || !member || !channel) {
    await interaction.editReply(await renderMessage('DM_ERROR'));
    return;
  }

  const host = await getHost(client, guild.id);

  if (host === undefined) {
    await interaction.editReply('This community is not registered for praise.');
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

  if (currentUser.roles.includes('ADMIN')) {
    const message = interaction.options.getString('message');

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
          const menu: StringSelectMenuInteraction = click;
          selectedUserType = menu.values[0];
          if (
            selectedUserType === 'ASSIGNED-QUANTIFIERS' ||
            selectedUserType === 'UNFINISHED-QUANTIFIERS'
          ) {
            const openPeriods = await apiClient
              .get<PeriodPaginatedResponseDto>('/periods', {
                headers: { host },
              })
              .then((res) =>
                res.data.docs.filter((doc) => doc.status === 'QUANTIFY')
              )
              .catch(() => undefined);

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
            content: `Preview announcement before continuing:\n---\n${
              message || ''
            }\n---`,
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
            content: `Preview announcement before continuing:\n---\n${
              message || ''
            }\n---`,
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
          await selectTargets(
            interaction,
            selectedUserType,
            selectedPeriod,
            message || '',
            host
          );
          break;
        }
        case 'cancel': {
          await interaction.editReply({
            content: 'User cancelled Interaction.',
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
  } else {
    await interaction.editReply({
      content:
        'You do not have the needed permissions to use this command. If you would like to perform admin actions, you would need to be granted an `ADMIN` role on the Praise Dashboard.',
    });
  }
};
