import { quantificationListTransformer } from '@praise/transformers';
import { Quantification, QuantificationDto } from '@praise/types';
import {
  PeriodDetailsReceiver,
  PeriodDetailsReceiverDto,
  PeriodDocument,
  PeriodDto,
} from './types';

const periodDocumentToDto = (periodDocument: PeriodDocument): PeriodDto => {
  const { _id, name, status, endDate, createdAt, updatedAt } = periodDocument;
  return {
    _id,
    name,
    status,
    endDate: endDate.toISOString(),
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
  };
};

export const periodDocumentListTransformer = (
  periodDocuments: PeriodDocument[] | undefined
): PeriodDto[] => {
  if (periodDocuments && Array.isArray(periodDocuments)) {
    return periodDocuments.map((periodDocument) =>
      periodDocumentToDto(periodDocument)
    );
  }
  return [];
};

export const periodDocumentTransformer = (
  periodDocument: PeriodDocument
): PeriodDto => {
  return periodDocumentToDto(periodDocument);
};

export const listOfQuantificationListsTransformer = (
  listOfQuantificationLists: Quantification[][] | undefined
): Array<Array<QuantificationDto>> => {
  if (listOfQuantificationLists && Array.isArray(listOfQuantificationLists)) {
    return listOfQuantificationLists.map((quantificationList) =>
      quantificationListTransformer(quantificationList)
    );
  }
  return [];
};

const periodDetailsReceiverToDto = (
  periodDetailsReceiver: PeriodDetailsReceiver
): PeriodDetailsReceiverDto => {
  const { _id, praiseCount, quantifications, score } = periodDetailsReceiver;
  return {
    _id: _id.toString(),
    praiseCount,
    quantifications: listOfQuantificationListsTransformer(quantifications),
    score,
  };
};

export const periodDetailsReceiverListTransformer = (
  periodDetailsReceiverList: PeriodDetailsReceiver[] | undefined
): PeriodDetailsReceiverDto[] => {
  if (periodDetailsReceiverList && Array.isArray(periodDetailsReceiverList)) {
    return periodDetailsReceiverList.map((periodDetailsReceiver) =>
      periodDetailsReceiverToDto(periodDetailsReceiver)
    );
  }
  return [];
};

export const periodDetailsReceiverTransformer = (
  periodDetailsReceiver: PeriodDetailsReceiver
): PeriodDetailsReceiverDto => {
  return periodDetailsReceiverToDto(periodDetailsReceiver);
};
