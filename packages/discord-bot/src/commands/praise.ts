import { SlashCommandBuilder } from '@discordjs/builders';
import { APIMessage } from 'discord-api-types/v9';
import logger from 'jet-logger';
import { praiseHandler } from '../handlers/praise';
import { Command } from '../interfaces/Command';
import { getMsgLink } from '../utils/format';

export const praise: Command = {
  data: new SlashCommandBuilder()
    .setName('praise')
    .setDescription('Praise a contribution! 🙏')
    .addStringOption((option) =>
      option
        .setName('receivers')
        .setDescription('Mention the user(s) you would like to praise.')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('reason')
        .setDescription('Describe the reason for this praise.')
        .setRequired(true)
    ),

  async execute(interaction) {
    try {
      if (!interaction.isCommand() || interaction.commandName !== 'praise')
        return;

      const msg = (await interaction.deferReply({
        fetchReply: true,
      })) as APIMessage | void;
      if (msg === undefined) return;
      await praiseHandler(
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
