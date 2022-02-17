import { userAccountTransformer } from '@useraccount/transformers';
import {
  PraiseDocument,
  PraiseDto,
  Quantification,
  QuantificationDto,
} from './types';

const quantificationToDto = (
  quantification: Quantification
): QuantificationDto => {
  const {
    quantifier,
    score,
    dismissed,
    duplicatePraise,
    createdAt,
    updatedAt,
  } = quantification;
  return {
    quantifier: quantifier._id,
    score,
    dismissed,
    duplicatePraise: duplicatePraise ? duplicatePraise._id : undefined,
    createdAt: createdAt ? createdAt.toISOString() : undefined,
    updatedAt: updatedAt ? updatedAt.toISOString() : undefined,
  };
};

export const quantificationListTransformer = (
  quantifications: Quantification[] | Quantification | undefined
): QuantificationDto[] => {
  if (quantifications) {
    if (Array.isArray(quantifications)) {
      return quantifications.map((quantification) =>
        quantificationToDto(quantification)
      );
    } else {
      return [quantificationToDto(quantifications)];
    }
  }
  return [];
};

const praiseDocumentToDto = (praiseDocument: PraiseDocument): PraiseDto => {
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
    quantifications: quantificationListTransformer(quantifications),
    giver: userAccountTransformer(giver),
    receiver: userAccountTransformer(receiver),
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
  };
};

export const praiseDocumentListTransformer = (
  praiseDocuments: PraiseDocument[] | undefined
): PraiseDto[] => {
  if (praiseDocuments && Array.isArray(praiseDocuments)) {
    return praiseDocuments.map((praiseDocument) =>
      praiseDocumentToDto(praiseDocument)
    );
  }
  return [];
};

export const praiseDocumentTransformer = (
  praiseDocument: PraiseDocument
): PraiseDto => {
  return praiseDocumentToDto(praiseDocument);
};
