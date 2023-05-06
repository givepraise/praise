import { EmbedBuilder } from 'discord.js';
import { PeriodDetailsDto } from '../api-schema';

/**
 * Generate embed message with top 20 leaderboard
 */
export const leaderboardEmbed = (
  periodDetails: PeriodDetailsDto
): EmbedBuilder => {
  let leaderboardContent = '';
  const periodReceivers = periodDetails.receivers;
  if (periodReceivers) {
    // Sort receivers by score and take top 20
    const sortedPeriodReceivers = [...periodReceivers]
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);

    // Generate leaderboard content
    for (const receiver of sortedPeriodReceivers) {
      if (receiver.platform === 'DISCORD') {
        leaderboardContent = leaderboardContent.concat(
          `> <@${receiver.accountId}> – ${receiver.score}\n`
        );
      } else {
        leaderboardContent = leaderboardContent.concat(
          `> ${receiver.name} – ${receiver.score}\n`
        );
      }
    }
  } else {
    leaderboardContent = 'No praise receivers found.';
  }

  const embed = new EmbedBuilder()
    .setTitle('Leaderboard')
    .setDescription(
      `Top 20 users by praise score received in the latest quantified period \n\n${leaderboardContent}`
    );

  return embed;
};
