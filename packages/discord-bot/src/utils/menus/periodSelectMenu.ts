import { Period } from '../api-schema';
import { StringSelectMenuBuilder } from 'discord.js';

/**
 * Generate Discord menu to select a period
 *
 * @param {PeriodDocument[]} periods
 * @returns {StringSelectMenuBuilder}
 */
export const periodSelectMenu = (
  periods: Period[]
): StringSelectMenuBuilder => {
  const periodMenu = new StringSelectMenuBuilder()
    .setCustomId('period-menu')
    .setPlaceholder('Select period');

  for (const period of periods) {
    periodMenu.addOptions([
      {
        label: period['name'],
        description: `End date: ${period.endDate}`,
        value: period['_id'],
      },
    ]);
  }
  return periodMenu;
};
