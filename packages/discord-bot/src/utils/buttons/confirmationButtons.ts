import { MessageButton } from 'discord.js';

export const confirmButton = new MessageButton()
  .setCustomId('confirm')
  .setLabel('Confirm')
  .setStyle('SUCCESS');

export const cancelButton = new MessageButton()
  .setCustomId('cancel')
  .setLabel('Cancel')
  .setStyle('DANGER');
