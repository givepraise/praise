import { SlashCommandBuilder } from '@discordjs/builders';
import { logger } from '../utils/logger';
import { Command } from '../interfaces/Command';
import { leaderboardHandler } from '../handlers/leaderboard';

export const leaderboard: Command = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription(
      'The top 20 users by praise score received in the latest quantified period.'
    ),
  async execute(client, interaction, host) {
    try {
      if (!interaction.isCommand() || interaction.commandName !== 'leaderboard')
        return;
      await interaction.deferReply({ ephemeral: true });
      await leaderboardHandler(client, interaction, host);
    } catch (err) {
      logger.error((err as Error).message);
    }
  },
};
