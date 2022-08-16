import { quantificationListTransformer } from '@/praise/transformers';
import { Quantification, QuantificationDto } from '@/praise/types';
import { UserModel } from '@/user/entities';
import { userAccountTransformer } from '@/useraccount/transformers';
import {
  PeriodDetailsReceiver,
  PeriodDetailsReceiverDto,
  PeriodDocument,
  PeriodDetailsDto,
  PeriodReceiverDto,
  PeriodReceiver,
} from './types';

/**
 * Serialize a PeriodDocument
 *
 * @param {PeriodDocument} periodDocument
 * @returns {PeriodDetailsDto}
 */
export const periodTransformer = (
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
 * Serialize a list of Praise.quantification lists
 *
 * @param {(Quantification[][] | undefined)} listOfQuantificationLists
 * @returns {Promise<Array<Array<QuantificationDto>>>}
 */
const listOfQuantificationListsTransformer = async (
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
 * @param {PeriodDetailsReceiver} periodReceiver
 * @returns {Promise<PeriodDetailsReceiverDto>}
 */
const periodReceiverToDto = async (
  periodReceiver: PeriodDetailsReceiver
): Promise<PeriodReceiverDto> => {
  const { _id, praiseCount, quantifications, scoreRealized, userAccounts } =
    periodReceiver;

  const receiver = await UserModel.findById(userAccounts[0].user);

  return {
    _id: _id.toString(),
    praiseCount,
    quantifications: await listOfQuantificationListsTransformer(
      quantifications
    ),
    ethereumAddress: receiver?.ethereumAddress,
    scoreRealized,
    userAccount:
      Array.isArray(userAccounts) && userAccounts.length > 0
        ? userAccountTransformer(userAccounts[0])
        : undefined,
  };
};

/**
 * Serialize relevant details about a list of Praise receivers in a period (with ETH address)
 *
 * @param {(PeriodReceiver[] | undefined)} periodReceiverList
 * @returns {Promise<PeriodReceiverDto[]>}
 */
export const periodReceiverListTransformer = async (
  periodReceiverList: PeriodDetailsReceiver[] | undefined
): Promise<PeriodReceiverDto[]> => {
  if (periodReceiverList && Array.isArray(periodReceiverList)) {
    const periodReceiverDto: PeriodReceiverDto[] = [];
    for (const pdr of periodReceiverList) {
      periodReceiverDto.push(await periodReceiverToDto(pdr));
    }
    return periodReceiverDto;
  }
  return [];
};
