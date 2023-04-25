import { StringSelectMenuBuilder } from 'discord.js';

/**
 * Generate Discord menu to select a user role or assignment status
 */
export const dmTargetMenu = new StringSelectMenuBuilder()
  .setCustomId('dm-menu')
  .setPlaceholder('Select user group')
  .addOptions([
    {
      label: 'All users',
      description: 'Send to all activated Praise users',
      value: 'USERS',
    },
    {
      label: 'All quantifiers',
      description: 'Send to all quantifiers',
      value: 'QUANTIFIERS',
    },
    {
      label: 'All assigned quantifiers',
      description: 'Send to all quantifiers assigned to a period',
      value: 'ASSIGNED-QUANTIFIERS',
    },
    {
      label: 'All unfinished quantifiers',
      description: 'Send to all unfinished quantifiers assigned to a period',
      value: 'UNFINISHED-QUANTIFIERS',
    },
  ]);
