import { MessageSelectMenu } from 'discord.js';

export const dmTargetMenu = new MessageSelectMenu()
  .setCustomId('dm-menu')
  .setPlaceholder('Select Target users from dropdown menu')
  .addOptions([
    {
      label: 'All Users',
      description: 'Sends DM to all activated praise users',
      value: 'USERS',
    },
    {
      label: 'All Quantifiers',
      description: 'Sends DM to all Quantifiers',
      value: 'QUANTIFIERS',
    },
    {
      label: 'All drafted Quantifiers',
      description:
        'Sends DM to all Quantifiers that are drafted in the latest praise period',
      value: 'DRAFTED-QUANTIFERS',
    },
    {
      label: 'Pending Quantifiers',
      description:
        "Sends DM to all quantifers that aren't done with their Quantification",
      value: 'PENDING-QUANTIFIERS',
    },
  ]);
