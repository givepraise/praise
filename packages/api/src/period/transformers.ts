import { quantificationListTransformer } from '@praise/transformers';
import { Quantification, QuantificationDto } from 'types/dist/praise/types';
import { userAccountTransformer } from '@useraccount/transformers';
import {
  PeriodDetailsReceiver,
  PeriodDetailsReceiverDto,
  PeriodDocument,
  PeriodDetailsDto,
} from 'types/dist/period/types';

const periodDocumentToDto = (
  periodDocument: PeriodDocument
): PeriodDetailsDto => {
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
): PeriodDetailsDto[] => {
  if (periodDocuments && Array.isArray(periodDocuments)) {
    return periodDocuments.map((periodDocument) =>
      periodDocumentToDto(periodDocument)
    );
  }
  return [];
};

export const periodDocumentTransformer = (
  periodDocument: PeriodDocument
): PeriodDetailsDto => {
  return periodDocumentToDto(periodDocument);
};

export const listOfQuantificationListsTransformer = async (
  listOfQuantificationLists: Quantification[][] | undefined
): Promise<Array<Array<QuantificationDto>>> => {
  if (listOfQuantificationLists && Array.isArray(listOfQuantificationLists)) {
    const quantifications: QuantificationDto[][] = [];
    for (const q of listOfQuantificationLists) {
      quantifications.push(await quantificationListTransformer(q));
    }
    return quantifications;
  }
  return [];
};

const periodDetailsReceiverToDto = async (
  periodDetailsReceiver: PeriodDetailsReceiver
): Promise<PeriodDetailsReceiverDto> => {
  const { _id, praiseCount, quantifications, scoreRealized, userAccounts } =
    periodDetailsReceiver;
  return {
    _id: _id.toString(),
    praiseCount,
    quantifications: await listOfQuantificationListsTransformer(
      quantifications
    ),
    scoreRealized,
    userAccount:
      Array.isArray(userAccounts) && userAccounts.length > 0
        ? userAccountTransformer(userAccounts[0])
        : undefined,
  };
};

export const periodDetailsReceiverListTransformer = async (
  periodDetailsReceiverList: PeriodDetailsReceiver[] | undefined
): Promise<PeriodDetailsReceiverDto[]> => {
  if (periodDetailsReceiverList && Array.isArray(periodDetailsReceiverList)) {
    const periodDetailsReceiverDto: PeriodDetailsReceiverDto[] = [];
    for (const pdr of periodDetailsReceiverList) {
      periodDetailsReceiverDto.push(await periodDetailsReceiverToDto(pdr));
    }
    return periodDetailsReceiverDto;
  }
  return [];
};

export const periodDetailsReceiverTransformer = async (
  periodDetailsReceiver: PeriodDetailsReceiver
): Promise<PeriodDetailsReceiverDto> => {
  const response = await periodDetailsReceiverToDto(periodDetailsReceiver);
  return response;
};
