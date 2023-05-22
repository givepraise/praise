import { SlashCommandBuilder } from '@discordjs/builders';
import { Command } from '../interfaces/Command';
import { whatsupHandler } from '../handlers/whatsup';

export const whatsup: Command = {
  data: new SlashCommandBuilder()
    .setName('whatsup')
    .setDescription(
      'Project updates from the community, things to look forward to, and more.'
    ),
  async execute(client, interaction, host) {
    if (!interaction.isCommand() || interaction.commandName !== 'whatsup')
      return;
    await interaction.deferReply({ ephemeral: true });
    await whatsupHandler(client, interaction, host);
  },
};
