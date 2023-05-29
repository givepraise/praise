import { SlashCommandBuilder } from '@discordjs/builders';
import { Command } from '../interfaces/Command';
import { leaderboardHandler } from '../handlers/leaderboard';

export const leaderboard: Command = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription(
      'The top 20 users by praise score received in the latest quantified period.'
    )
    .addStringOption((option) =>
      option
        .setName('type')
        .setDescription('Select type of leaderboard')
        .addChoices(
          { name: 'receivers', value: 'receivers' },
          { name: 'givers', value: 'givers' }
        )
        .setRequired(true)
    ),
  async execute(client, interaction, host) {
    if (!interaction.isCommand() || interaction.commandName !== 'leaderboard')
      return;
    await interaction.deferReply({ ephemeral: true });
    await leaderboardHandler(client, interaction, host);
  },
};
