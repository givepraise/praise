import { BadRequestError } from '@error/errors';
import { settingValue } from '@shared/settings';
import mongoose from 'mongoose';
import { find } from 'lodash';
import { PraiseModel } from '../entities';
import { PraiseDocument, Quantification } from '../types';
import { getPraisePeriod } from './core';

export const calculateQuantificationsCompositeScore = async (
  quantifications: Quantification[],
  duplicatePraisePercentage: number
): Promise<number> => {
  if (!quantifications) return 0;

  let si = 0;
  let s = 0;
  for (const quantification of quantifications) {
    if (quantification.score > 0) {
      s += quantification.score;
      si++;
    }
    if (quantification.duplicatePraise) {
      const p = await PraiseModel.findById(quantification.duplicatePraise);
      if (p) {
        for (const pq of p.quantifications) {
          if (
            pq?.quantifier &&
            quantification.quantifier &&
            pq.quantifier.equals(quantification.quantifier) &&
            pq.score > 0
          ) {
            s += Math.floor(pq.score * duplicatePraisePercentage);
            si++;
          }
        }
      }
    }
  }
  if (s > 0) {
    return Math.floor(s / si);
  }
  return 0;
};

export const calculatePraiseScore = async (
  praise: PraiseDocument
): Promise<number> => {
  const period = await getPraisePeriod(praise);
  if (!period) return 0;

  const duplicatePraisePercentage = (await settingValue(
    'PRAISE_QUANTIFY_DUPLICATE_PRAISE_PERCENTAGE',
    period._id
  )) as number;
  if (!duplicatePraisePercentage)
    throw new BadRequestError(
      "Invalid setting 'PRAISE_QUANTIFY_DUPLICATE_PRAISE_PERCENTAGE'"
    );

  return calculateQuantificationsCompositeScore(
    praise.quantifications,
    duplicatePraisePercentage
  );
};

export const calculateDuplicateScore = async (
  quantification: Quantification,
  periodId: mongoose.Schema.Types.ObjectId
): Promise<number> => {
  const duplicatePraisePercentage = (await settingValue(
    'PRAISE_QUANTIFY_DUPLICATE_PRAISE_PERCENTAGE',
    periodId
  )) as number;
  if (!duplicatePraisePercentage)
    throw new BadRequestError(
      "Invalid setting 'PRAISE_QUANTIFY_DUPLICATE_PRAISE_PERCENTAGE'"
    );

  return Math.floor(quantification.score * duplicatePraisePercentage);
};

export const calculateQuantificationScore = async (
  q: Quantification,
  periodId: mongoose.Schema.Types.ObjectId
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
