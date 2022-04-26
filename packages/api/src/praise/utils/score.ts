import { BadRequestError } from '@error/errors';
import { settingValue } from '@shared/settings';
import { Types } from 'mongoose';
import { find, sum } from 'lodash';
import { PraiseModel } from '../entities';
import { PraiseDocument, Quantification } from '../types';
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
 * Calculates a single "composite" score from a list of quantifications (of the same praise)
 *
 * @param quantifications list of quantifications to be included in composite score
 * @returns
 */
export const calculateQuantificationsCompositeScore = async (
  quantifications: Quantification[]
): Promise<number> => {
  let si = 0;
  let s = 0;
  for (const quantification of quantifications) {
    if (quantification.duplicatePraise) {
      s += await calculateQuantificationDuplicateScore(quantification);
      si++;
    } else if (quantification.score > 0) {
      s += quantification.score;
      si++;
    }
  }
  if (s > 0) {
    return Math.floor(s / si);
  }
  return 0;
};

/**
 * Calculates a single "composite" score from a list of praise composite scores
 *
 * @param scores list of receiver's praise composite scores
 * @returns
 */
export const calculateReceiverCompositeScore = (scores: number[]): number =>
  sum(scores);

export const calculatePraiseScore = async (
  praise: PraiseDocument
): Promise<number> => {
  return calculateQuantificationsCompositeScore(praise.quantifications);
};

export const calculateQuantificationScore = async (
  q: Quantification,
  periodId: Types.ObjectId
): Promise<number> => {
  let score = q.score;

  if (q.duplicatePraise) {
    const duplicatePraise = await PraiseModel.findById(q.duplicatePraise._id);

    if (duplicatePraise && duplicatePraise.quantifications) {
      const quantification = find(duplicatePraise.quantifications, (q2) =>
        q2.quantifier.equals(q.quantifier)
      );
      if (quantification) {
        score = quantification.dismissed
          ? 0
          : await calculateDuplicateScore(quantification, periodId);
      }
    }
  }

  return score;
};
