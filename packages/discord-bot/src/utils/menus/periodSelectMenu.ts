import { MessageSelectMenu } from 'discord.js';
import { PeriodDocument } from 'api/dist/period/types';

export const periodSelectMenu = (
  periods: (PeriodDocument & {
    _id: any;
  })[]
): MessageSelectMenu => {
  const periodMenu = new MessageSelectMenu()
    .setCustomId('period-menu')
    .setPlaceholder('Select Period from dropdown menu');

  for (const period of periods) {
    periodMenu.addOptions([
      {
        label: period['name'],
        description: `Period with end date - ${period.endDate.toDateString()}`,
        value: period['name'],
      },
    ]);
  }
  return periodMenu;
};
