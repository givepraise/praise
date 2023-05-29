import { EmbedBuilder } from 'discord.js';
import { PeriodDetailsDto } from '../api-schema';

/**
 * Generate embed message with top 20 leaderboard
 */
export const leaderboardEmbed = (
  periodDetails: PeriodDetailsDto,
  leaderboardType: string
): EmbedBuilder => {
  let leaderboardContent = '';

  const users =
    leaderboardType === 'receivers'
      ? periodDetails.receivers
      : periodDetails.givers;

  if (users) {
    // Sort users by score and take top 20
    const sortedPeriodUsers = [...users]
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);

    // Generate leaderboard content
    for (const user of sortedPeriodUsers) {
      if (user.platform === 'DISCORD') {
        leaderboardContent = leaderboardContent.concat(
          `> <@${user.accountId}> – ${user.score}\n`
        );
      } else {
        leaderboardContent = leaderboardContent.concat(
          `> ${user.name} – ${user.score}\n`
        );
      }
    }
  } else {
    leaderboardContent = 'No praise users found.';
  }

  const embed = new EmbedBuilder()
    .setTitle('Leaderboard')
    .setDescription(
      `Top 20 ${
        leaderboardType || 'receivers'
      } by praise score received in the latest quantified period \n\n${leaderboardContent}`
    );

  return embed;
};
