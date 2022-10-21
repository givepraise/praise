import { ButtonBuilder, ButtonStyle } from 'discord.js';

export const continueButton = new ButtonBuilder()
  .setCustomId('continue')
  .setLabel('Continue')
  .setStyle(ButtonStyle.Success);

export const cancelButton = new ButtonBuilder()
  .setCustomId('cancel')
  .setLabel('Cancel')
  .setStyle(ButtonStyle.Danger);
