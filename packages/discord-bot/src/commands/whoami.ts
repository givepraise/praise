import { SlashCommandBuilder } from '@discordjs/builders';
import { whoamiHandler } from '../handlers/whoami';
import { Command } from '../interfaces/Command';

export const whoami: Command = {
  data: new SlashCommandBuilder()
    .setName('whoami')
    .setDescription('Find praise info about yourself'),
  async execute(client, interaction, host) {
    if (!interaction.isCommand() || interaction.commandName !== 'whoami')
      return;
    await interaction.deferReply({ ephemeral: true });
    await whoamiHandler(client, interaction, host);
  },
};
