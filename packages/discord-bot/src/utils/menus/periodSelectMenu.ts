import { SelectMenuBuilder } from 'discord.js';
import { PeriodDocument } from 'api/dist/period/types';

/**
 * Generate Discord menu to select a period
 *
 * @param {PeriodDocument[]} periods
 * @returns {MessageSelectMenu}
 */
export const periodSelectMenu = (
  periods: PeriodDocument[]
): SelectMenuBuilder => {
  const periodMenu = new SelectMenuBuilder()
    .setCustomId('period-menu')
    .setPlaceholder('Select period');

  for (const period of periods) {
    periodMenu.addOptions([
      {
        label: period['name'],
        description: `End date: ${period.endDate.toDateString()}`,
        value: period['name'],
      },
    ]);
  }
  return periodMenu;
};
