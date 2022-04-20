import { SlashCommandBuilder } from '@discordjs/builders';
import { APIMessage } from 'discord-api-types/v9';
import logger from 'jet-logger';
import { whoamiHandler } from '../handlers/whoami';
import { Command } from '../interfaces/Command';

export const whoami: Command = {
  data: new SlashCommandBuilder()
    .setName('whoami')
    .setDescription('Find praise info about yourself'),
  async execute(interaction) {
    try {
      if (!interaction.isCommand() || interaction.commandName !== 'whoami')
        return;
      await interaction.deferReply({ ephemeral: true });
      await whoamiHandler(interaction);
    } catch (err) {
      logger.err(err);
    }
  },
};
