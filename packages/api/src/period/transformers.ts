import { quantificationListTransformer } from '@praise/transformers';
import { Quantification, QuantificationDto } from '@praise/types';
import { userAccountTransformer } from '@useraccount/transformers';
import {
  PeriodDetailsReceiver,
  PeriodDetailsReceiverDto,
  PeriodDocument,
  PeriodDetailsDto,
} from './types';

/**
 * Serialize a PeriodDocument
 *
 * @param {PeriodDocument} periodDocument
 * @returns {PeriodDetailsDto}
 */
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

/**
 * Serialize a list of PeriodDocuments
 *
 * @param {(PeriodDocument[] | undefined)} periodDocuments
 * @returns {PeriodDetailsDto[]}
 */
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

/**
 * Serialize a PeriodDocument
 *
 * @param {PeriodDocument} periodDocument
 * @returns {PeriodDetailsDto}
 */
export const periodDocumentTransformer = (
  periodDocument: PeriodDocument
): PeriodDetailsDto => {
  return periodDocumentToDto(periodDocument);
};

/**
 * Serialize a list of Praise.quantification lists
 *
 * @param {(Quantification[][] | undefined)} listOfQuantificationLists
 * @returns {Promise<Array<Array<QuantificationDto>>>}
 */
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

/**
 * Serialize relevant details about a Praise receiver in a period
 *
 * @param {PeriodDetailsReceiver} periodDetailsReceiver
 * @returns {Promise<PeriodDetailsReceiverDto>}
 */
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

/**
 * Serialize relevant details about a list of Praise receivers in a period
 *
 * @param {(PeriodDetailsReceiver[] | undefined)} periodDetailsReceiverList
 * @returns {Promise<PeriodDetailsReceiverDto[]>}
 */
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

/**
 * Serialize relevant details about a Praise receiver in a period
 *
 * @param {PeriodDetailsReceiver} periodDetailsReceiver
 * @returns {Promise<PeriodDetailsReceiverDto>}
 */
export const periodDetailsReceiverTransformer = async (
  periodDetailsReceiver: PeriodDetailsReceiver
): Promise<PeriodDetailsReceiverDto> => {
  const response = await periodDetailsReceiverToDto(periodDetailsReceiver);
  return response;
};
