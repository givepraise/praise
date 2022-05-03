import { PeriodModel } from '@period/entities';
import { PeriodDocument } from '@period/types';
import { getPreviousPeriodEndDate } from '@period/utils';
import { PraiseModel } from '@praise/entities';
import { connectDatabase } from './core';
import yargs from 'yargs';
import { exit } from 'process';

/**
 * Replace a currently assigned quantifier during an active period
 * @param periodId
 * @param currentQuantifierId
 * @param newQuantifierId
 */
const replaceActiveQuantifier = async (
  periodId: string,
  currentQuantifierId: string,
  newQuantifierId: string
) => {
  const period: PeriodDocument | null = await PeriodModel.findOne({
    _id: periodId,
  });
  if (!period) throw Error('Period not found');
  const previousPeriodEndDate: Date = await getPreviousPeriodEndDate(period);

  const result = await PraiseModel.updateMany(
    {
      // Praise within time period
      createdAt: { $gt: previousPeriodEndDate, $lte: period.endDate },

      // Original quantifier
      'quantifications.quantifier': currentQuantifierId,
    },
    {
      $set: {
        // Reset score
        'quantifications.$[elem].score': 0,

        // Assign new quantifier
        'quantifications.$[elem].quantifier': newQuantifierId,
      },
    },
    {
      arrayFilters: [
        {
          'elem.quantifier': currentQuantifierId,
        },
      ],
    }
  );

  if (result.modifiedCount === 0) {
    console.log(
      `\nNo praise found within period ${periodId} assigned to quantifier ${currentQuantifierId}`
    );
  } else {
    console.log(
      `\nReplaced quantifier ${currentQuantifierId} with ${newQuantifierId} for ${result.modifiedCount} praise in period ${periodId}`
    );
  }
};

interface Arguments {
  periodId: string;
  currentQuantifierId: string;
  newQuantifierId: string;
}

const run = async (): Promise<void> => {
  const argv: any = yargs
    .command('$0', 'Replace a specified quantifier who is currently assigned')
    .option('periodId', {
      type: 'string',
      describe: 'id of active period',
      demand: true,
    })
    .option('currentQuantifierId', {
      type: 'string',
      describe: 'id of current quantifier you wish to replace',
      demand: true,
    })
    .option('newQuantifierId', {
      type: 'string',
      describe: 'id of new quantifier',
      demand: true,
    })
    .help().argv;

  const { periodId, currentQuantifierId, newQuantifierId } = argv;

  console.log(argv.periodId);
  await connectDatabase('localhost');
  await replaceActiveQuantifier(periodId, currentQuantifierId, newQuantifierId);
  exit();
};

run();
