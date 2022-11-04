import { ChatInputCommandInteraction } from 'discord.js';
import { logger } from 'api/src/shared/logger';

export const handleErrors = async (
  interaction: ChatInputCommandInteraction,
  err: Error
): Promise<void> => {
  logger.error(err.message);
  if (err.name === 'MongooseError') {
    await interaction.editReply({
      content: '❌ Could not execute command. Database error',
    });
  }
};
