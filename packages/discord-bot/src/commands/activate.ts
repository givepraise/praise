import { SlashCommandBuilder } from '@discordjs/builders';
import { activationHandler } from '../handlers/activate';
import { Command } from '../interfaces/Command';

export const activate: Command = {
  data: new SlashCommandBuilder()
    .setName('activate')
    .setDescription(
      'Activate your Praise account by linking your eth address.'
    ),

  async execute(client, interaction, host) {
    if (!interaction.isCommand() || interaction.commandName !== 'activate')
      return;
    await activationHandler(client, interaction, host);
  },

  help: {
    name: 'activate',
    text: 'Command to activate praise for discord account. You need to open the link returned by the command and sign a message with your eth wallet to link and activate your discord account with your eth wallet address.\n**Usage**: `/activate`\n',
  },
};
