import { renderMessage } from '../utils/renderMessage';
import {
  Period,
  PeriodPaginatedResponseDto,
  PeriodDetailsDto,
} from '../utils/api-schema';
import { apiClient } from '../utils/api';
import { CommandHandler } from '../interfaces/CommandHandler';
import { leaderboardEmbed } from '../utils/embeds/leaderboardEmbed';
import { logger } from '../utils/logger';

/**
 * Execute command /leaderboard
 * Generates a leaderboard of the top 20 users by praise score received in the
 * latest quantified period
 */
export const leaderboardHandler: CommandHandler = async (
  client,
  interaction,
  host
): Promise<void> => {
  const { member, guild } = interaction;
  if (!guild || !member) {
    await interaction.editReply(await renderMessage('DM_ERROR'));
    return;
  }

  // List all periods
  let periods: Period[] = [];
  try {
    const response = await apiClient.get<PeriodPaginatedResponseDto>(
      'periods',
      {
        headers: { host: host },
      }
    );
    periods = [...response.data.docs];
  } catch (err) {
    logger.error(err);
    await interaction.editReply(
      'No praise periods found. Try again after having created a period and quantified some praise.'
    );
    return;
  }

  // Leaderboard content is based on the quantified praise in the latest closed period
  const latestClosedPeriod = periods.find(
    (period) => period.status === 'CLOSED'
  );

  if (!latestClosedPeriod) {
    await interaction.editReply(
      'No closed periods found. Try again after having quantified some praise.'
    );
    return;
  }

  // Get period details and generate leaderboard embed
  try {
    const response = await apiClient.get<PeriodDetailsDto>(
      `periods/${latestClosedPeriod?._id}`,
      {
        headers: { host: host },
      }
    );
    await interaction.editReply({
      embeds: [leaderboardEmbed(response.data)],
    });
  } catch (err) {
    logger.error(err);
    await interaction.editReply(
      'Unable to get period details or unable to construct leaderboard.'
    );
  }
};
