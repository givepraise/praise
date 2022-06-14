import { userAccountTransformer } from '@useraccount/transformers';
import {
  PraiseDocument,
  PraiseDto,
  Quantification,
  QuantificationDto,
} from 'types/dist/praise/types';
import {
  calculateQuantificationScore,
  calculateQuantificationsCompositeScore,
} from './utils/score';

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

export const praiseDocumentTransformer = async (
  praiseDocument: PraiseDocument
): Promise<PraiseDto> => {
  return praiseDocumentToDto(praiseDocument);
};

export const praiseDocumentListTransformer = async (
  praiseDocuments: PraiseDocument[]
): Promise<PraiseDto[]> => {
  return Promise.all(praiseDocuments.map((p) => praiseDocumentTransformer(p)));
};
