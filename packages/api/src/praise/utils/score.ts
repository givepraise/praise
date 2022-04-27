import { BadRequestError } from '@error/errors';
import { settingValue } from '@shared/settings';
import { Types } from 'mongoose';
import { sum } from 'lodash';
import { PraiseModel } from '../entities';
import { Quantification } from '../types';
import { getPraisePeriod } from './core';

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

  return Math.floor(originalQuantification.score * duplicatePraisePercentage);
};

export const calculateQuantificationDuplicateScore = async (
  quantification: Quantification
): Promise<number> => {
  let duplicateScore = 0;

  if (quantification.duplicatePraise) {
    const praise = await PraiseModel.findById(
      quantification.duplicatePraise._id
    );

    if (praise && praise.quantifications) {
      const originalQuantification = praise.quantifications.find((q) =>
        q.quantifier.equals(quantification.quantifier)
      );
      if (originalQuantification && originalQuantification.dismissed) {
        duplicateScore = 0;
      } else if (originalQuantification && !originalQuantification.dismissed) {
        const period = await getPraisePeriod(praise);
        if (!period) throw new Error('Quantification has no associated period');

        duplicateScore = await calculateDuplicateScore(
          originalQuantification,
          period._id
        );
      }
    }
  }

  return duplicateScore;
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
  const completedQuantifications = quantifications.filter((q) => q.completed);
  if (completedQuantifications.length === 0) return 0;

  const scores = await Promise.all(
    completedQuantifications.map((q) => calculateQuantificationScore(q))
  );

  const compositeScore = Math.floor(
    sum(scores) / completedQuantifications.length
  );

  return compositeScore;
};

/**
 * Calculates a single "composite" score from a list of praise composite scores
 *
 * @param scores list of receiver's praise composite scores
 * @returns
 */
export const calculateReceiverCompositeScore = (scores: number[]): number =>
  sum(scores);
