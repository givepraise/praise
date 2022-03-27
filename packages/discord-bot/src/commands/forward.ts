import { SlashCommandBuilder } from '@discordjs/builders';
import { APIMessage } from 'discord-api-types/v9';
import logger from 'jet-logger';
import { forwardHandler } from '../handlers/forward';
import { Command } from '../interfaces/Command';
import { getMsgLink } from '../utils/format';

export const forward: Command = {
  data: new SlashCommandBuilder()
    .setName('forward')
    .setDescription('Forwards praise from one user to another user')
    .addUserOption((option) =>
      option
        .setName('from')
        .setDescription('The person from whom the praise is coming from')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('to')
        .setDescription('Mention the users to whom this praise should go')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('reason')
        .setDescription('The reason given for this Praise')
        .setRequired(true)
    ),

  async execute(interaction) {
    try {
      if (!interaction.isCommand() || interaction.commandName !== 'forward')
        return;

      const msg = (await interaction.deferReply({
        fetchReply: true,
      })) as APIMessage | void;
      if (msg === undefined) return;
      await forwardHandler(
        interaction,
        getMsgLink(
          interaction.guildId || '',
          interaction.channelId || '',
          msg.id
        )
      );
    } catch (err) {
      logger.err(err);
    }
  },
};
