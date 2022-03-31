import { SlashCommandBuilder } from '@discordjs/builders';
import logger from 'jet-logger';
import { activationHandler } from '../handlers/activate';
import { Command } from '../interfaces/Command';

export const activate: Command = {
  data: new SlashCommandBuilder()
    .setName('activate')
    .setDescription(
      'Activate your Praise account by linking your eth address.'
    ),

  async execute(interaction) {
    try {
      if (!interaction.isCommand() || interaction.commandName !== 'activate')
        return;
      await activationHandler(interaction);
    } catch (err) {
      logger.err(err);
    }
  },
};
