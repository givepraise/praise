/* TODO - replace db access with api2 calls */
import { StringSelectMenuBuilder } from 'discord.js';
import { PeriodDocument } from 'api/dist/period/types';

/**
 * Generate Discord menu to select a period
 *
 * @param {PeriodDocument[]} periods
 * @returns {StringSelectMenuBuilder}
 */
export const periodSelectMenu = (
  periods: PeriodDocument[]
): StringSelectMenuBuilder => {
  const periodMenu = new StringSelectMenuBuilder()
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
