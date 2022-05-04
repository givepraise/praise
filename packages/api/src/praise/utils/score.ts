import { BadRequestError } from '@error/errors';
import { settingValue } from '@shared/settings';
import { PeriodDetailsReceiver } from '@period/types';
import { Types } from 'mongoose';
import { sum } from 'lodash';
import { PraiseModel } from '../entities';
import { Quantification } from '../types';
import { getPraisePeriod, isQuantificationCompleted } from './core';

/**
 * Use 2 digits of precision
 */
const DIGITS_PRECISION = 2;

/**
 * Calculate a quantification score of a praise marked duplicate
 *
 * @param originalQuantification the "original" praise's quantification (i.e. the quantification by the same user of the "original" praise instance)
 * @param periodId
 * @returns
 */
const calculateDuplicateScore = async (
  originalQuantification: Quantification,
  periodId: Types.ObjectId
): Promise<number> => {
  const duplicatePraisePercentage = (await settingValue(
    'PRAISE_QUANTIFY_DUPLICATE_PRAISE_PERCENTAGE',
    periodId
  )) as number;
  if (!duplicatePraisePercentage)
    throw new BadRequestError(
      "Invalid setting 'PRAISE_QUANTIFY_DUPLICATE_PRAISE_PERCENTAGE'"
    );

  const score = +(
    originalQuantification.score * duplicatePraisePercentage
  ).toFixed(DIGITS_PRECISION);

  return score;
};

const calculateQuantificationDuplicateScore = async (
  quantification: Quantification
): Promise<number> => {
  if (!quantification.duplicatePraise)
    throw Error(
      'Quantification does not have duplicatePraise, cannot calculate duplicate score'
    );

  let score = 0;
  const praise = await PraiseModel.findById(quantification.duplicatePraise._id);

  if (praise && praise.quantifications) {
    const originalQuantification = praise.quantifications.find((q) =>
      q.quantifier.equals(quantification.quantifier)
    );
    if (originalQuantification && originalQuantification.dismissed) {
      score = 0;
    } else if (originalQuantification && !originalQuantification.dismissed) {
      const period = await getPraisePeriod(praise);
      if (!period) throw new Error('Quantification has no associated period');

      score = await calculateDuplicateScore(originalQuantification, period._id);
    }
  }

  return score;
};

/**
 * Calculate the score of a given quantification - based on it's manual score value, marked duplicate value, and marked dismissed value
 *
 * @param quantification
 * @returns
 */
export const calculateQuantificationScore = async (
  quantification: Quantification
): Promise<number> => {
  let score = quantification.score;

  if (quantification.dismissed) {
    score = 0;
  } else if (quantification.duplicatePraise) {
    score = await calculateQuantificationDuplicateScore(quantification);
  }

  return score;
};

/**
 * Calculates a single "composite" score from a list of quantifications (of the same praise)
 *
 * @param quantifications list of quantifications to be included in composite score
 * @returns
 */
export const calculateQuantificationsCompositeScore = async (
  quantifications: Quantification[]
): Promise<number> => {
  const completedQuantifications = quantifications.filter((q) =>
    isQuantificationCompleted(q)
  );
  if (completedQuantifications.length === 0) return 0;

  const scores = await Promise.all(
    completedQuantifications.map((q) => calculateQuantificationScore(q))
  );

  const compositeScore = +(
    sum(scores) / completedQuantifications.length
  ).toFixed(DIGITS_PRECISION);

  return compositeScore;
};

/**
 * Calculates a single "composite" score from a list of praise composite scores
 *
 * @param scores list of receiver's praise composite scores
 * @returns
 */
export const calculateReceiverCompositeScore = async (
  receiver: PeriodDetailsReceiver
): Promise<number> => {
  if (!receiver.quantifications) return 0;
  if (receiver.quantifications.length === 0) return 0;

  const compositeScores = await Promise.all(
    receiver.quantifications.map((q) =>
      calculateQuantificationsCompositeScore(q)
    )
  );

  const score = +sum(compositeScores).toFixed(DIGITS_PRECISION);

  return score;
};
