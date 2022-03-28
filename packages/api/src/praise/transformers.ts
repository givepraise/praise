import { BadRequestError } from '@error/errors';
import { settingFloat } from '@shared/settings';
import { userAccountTransformer } from '@useraccount/transformers';
import mongoose from 'mongoose';
import { PraiseModel } from './entities';
import {
  PraiseDocument,
  PraiseDto,
  Quantification,
  QuantificationDto,
} from './types';
import { getPraisePeriod } from './utils';

export const calculateDuplicateScore = async (
  quantification: Quantification,
  periodId: mongoose.Schema.Types.ObjectId
): Promise<number> => {
  const duplicatePraisePercentage = await settingFloat(
    'PRAISE_QUANTIFY_DUPLICATE_PRAISE_PERCENTAGE',
    periodId
  );
  if (!duplicatePraisePercentage)
    throw new BadRequestError(
      "Invalid setting 'PRAISE_QUANTIFY_DUPLICATE_PRAISE_PERCENTAGE'"
    );

  return Math.floor(quantification.score * duplicatePraisePercentage);
};

const quantificationToDto = async (
  quantification: Quantification
): Promise<QuantificationDto> => {
  const {
    quantifier,
    score,
    dismissed,
    duplicatePraise,
    createdAt,
    updatedAt,
  } = quantification;

  let duplicateScore = 0;
  if (duplicatePraise) {
    const praise = await PraiseModel.findById(duplicatePraise._id);
    if (praise && praise.quantifications) {
      const quantification = praise.quantifications.find((q) =>
        q.quantifier.equals(quantifier)
      );
      if (quantification && quantification.dismissed) {
        duplicateScore = 0;
      } else if (quantification && !quantification.dismissed) {
        const period = await getPraisePeriod(praise);
        if (!period) throw new Error('Quantification has no associated period');

        duplicateScore = await calculateDuplicateScore(
          quantification,
          period._id
        );
      }
    }
  }
  return {
    quantifier: quantifier._id,
    score,
    dismissed,
    duplicatePraise: duplicatePraise ? duplicatePraise._id : undefined,
    duplicateScore,
    createdAt: createdAt ? createdAt.toISOString() : undefined,
    updatedAt: updatedAt ? updatedAt.toISOString() : undefined,
  };
};

export const quantificationListTransformer = async (
  quantifications: Quantification[] | Quantification | undefined
): Promise<QuantificationDto[]> => {
  if (quantifications) {
    if (Array.isArray(quantifications)) {
      const quantificationDto: QuantificationDto[] = [];
      for (const q of quantifications) {
        quantificationDto.push(await quantificationToDto(q));
      }
      return quantificationDto;
    } else {
      return [await quantificationToDto(quantifications)];
    }
  }
  return [];
};

const praiseDocumentToDto = async (
  praiseDocument: PraiseDocument
): Promise<PraiseDto> => {
  const {
    _id,
    reason,
    sourceId,
    sourceName,
    quantifications,
    giver,
    receiver,
    createdAt,
    updatedAt,
  } = praiseDocument;
  return {
    _id,
    reason,
    sourceId,
    sourceName,
    quantifications: await quantificationListTransformer(quantifications),
    giver: userAccountTransformer(giver),
    receiver: userAccountTransformer(receiver),
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
  };
};

export const praiseDocumentListTransformer = async (
  praiseDocuments: PraiseDocument[] | undefined
): Promise<PraiseDto[]> => {
  if (praiseDocuments && Array.isArray(praiseDocuments)) {
    const praiseDto: PraiseDto[] = [];
    for (const pd of praiseDocuments) {
      praiseDto.push(await praiseDocumentToDto(pd));
    }
    return praiseDto;
  }
  return [];
};

export const praiseDocumentTransformer = async (
  praiseDocument: PraiseDocument
): Promise<PraiseDto> => {
  return await praiseDocumentToDto(praiseDocument);
};
