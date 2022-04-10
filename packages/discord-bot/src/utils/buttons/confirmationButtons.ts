import { MessageButton } from 'discord.js';

export const continueButton = new MessageButton()
  .setCustomId('continue')
  .setLabel('Continue')
  .setStyle('SUCCESS');

export const cancelButton = new MessageButton()
  .setCustomId('cancel')
  .setLabel('Cancel')
  .setStyle('DANGER');
