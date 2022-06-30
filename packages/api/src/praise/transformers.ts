import { userAccountTransformer } from '@/useraccount/transformers';
import {
  PraiseDocument,
  PraiseDto,
  Quantification,
  QuantificationDto,
} from './types';
import {
  calculateQuantificationScore,
  calculateQuantificationsCompositeScore,
} from './utils/score';

/**
 * Serialize a Praise.quantification
 *
 * @param {Quantification} quantification
 * @returns {Promise<QuantificationDto>}
 */
const quantificationTransformer = async (
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

  const scoreRealized = await calculateQuantificationScore(quantification);

  return {
    quantifier: quantifier._id,
    score,
    scoreRealized,
    dismissed,
    duplicatePraise: duplicatePraise ? duplicatePraise._id : undefined,
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
  };
};

/**
 * Serialize a list of Praise.quantification
 *
 * @param {(Quantification[] | Quantification | undefined)} quantifications
 * @returns {Promise<QuantificationDto[]>}
 */
export const quantificationListTransformer = async (
  quantifications: Quantification[] | Quantification | undefined
): Promise<QuantificationDto[]> => {
  if (quantifications) {
    if (Array.isArray(quantifications)) {
      const quantificationDto: QuantificationDto[] = [];
      for (const q of quantifications) {
        quantificationDto.push(await quantificationTransformer(q));
      }
      return quantificationDto;
    } else {
      return [await quantificationTransformer(quantifications)];
    }
  }
  return [];
};

/**
 * Serialize a Praise
 *
 * @param {PraiseDocument} praiseDocument
 * @returns {Promise<PraiseDto>}
 */
export const praiseTransformer = async (
  praiseDocument: PraiseDocument
): Promise<PraiseDto> => {
  const {
    _id,
    reasonRealized,
    sourceId,
    sourceName,
    quantifications,
    giver,
    receiver,
    forwarder,
    createdAt,
    updatedAt,
  } = praiseDocument;

  return {
    _id,
    reasonRealized,
    sourceId,
    sourceName,
    quantifications: await quantificationListTransformer(quantifications),
    giver: userAccountTransformer(giver),
    receiver: userAccountTransformer(receiver),
    forwarder: forwarder ? userAccountTransformer(forwarder) : undefined,
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
    scoreRealized: await calculateQuantificationsCompositeScore(
      praiseDocument.quantifications
    ),
  };
};

/**
 * Serialize a list of Praise
 *
 * @param {PraiseDocument[]} praiseDocuments
 * @returns {Promise<PraiseDto[]>}
 */
export const praiseListTransformer = async (
  praiseDocuments: PraiseDocument[]
): Promise<PraiseDto[]> => {
  return Promise.all(praiseDocuments.map((p) => praiseTransformer(p)));
};
