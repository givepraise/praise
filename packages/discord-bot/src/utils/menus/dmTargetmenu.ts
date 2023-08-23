import { StringSelectMenuBuilder } from 'discord.js';

/**
 * Generate Discord menu to select a user role or assignment status
 */
export const dmTargetMenu = new StringSelectMenuBuilder()
  .setCustomId('dm-menu')
  .setPlaceholder('Select user group')
  .addOptions([
    {
      label: 'All activated users',
      description: 'Send to all activated Praise users',
      value: 'ACTIVATED-USERS',
    },
    {
      label: 'All unactivated users',
      description: 'Send to all unactivated Praise users',
      value: 'UNACTIVATED-USERS',
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
      label: 'All period praise receivers',
      description: 'Send to all receivers praise in a period',
      value: 'RECEIVERS',
    },
    {
      label: 'All unfinished quantifiers',
      description: 'Send to all unfinished quantifiers assigned to a period',
      value: 'UNFINISHED-QUANTIFIERS',
    },
  ]);
