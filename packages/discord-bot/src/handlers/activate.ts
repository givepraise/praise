import { CommandHandler } from '../interfaces/CommandHandler';
import { renderMessage } from '../utils/renderMessage';
import { sendActivationMessage } from '../utils/sendActivationMessage';

/**
 * Executes command /activate
 *  Creates a one-time link on the Praise frontend linking to the activate page
 *  where the user can associate their Discord user with a UserAccount
 *
 */
export const activationHandler: CommandHandler = async (
  client,
  interaction,
  host
) => {
  const { member, guild } = interaction;
  if (!guild || !member) {
    await interaction.editReply(await renderMessage('DM_ERROR'));
    return;
  }

  await sendActivationMessage(interaction, host, member);
};
