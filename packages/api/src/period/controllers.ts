import {
  BadRequestError,
  InternalServerError,
  NotFoundError,
} from '@error/errors';
import { PraiseModel } from '@praise/entities';
import { praiseDocumentListTransformer } from '@praise/transformers';
import {
  PraiseDetailsDto,
  PraiseDto,
  Quantifier,
  QuantifierPoolById,
  Receiver,
} from '@praise/types';
import { praiseWithScore } from '@praise/utils';
import { getQueryInput, getQuerySort } from '@shared/functions';
import { settingInt } from '@shared/settings';
import {
  PaginatedResponseBody,
  QueryInputParsedQs,
  TypedRequestBody,
  TypedRequestQuery,
  TypedResponse,
} from '@shared/types';
import { UserModel } from '@user/entities';
import { UserRole } from '@user/types';
import { UserAccountDocument } from '@useraccount/types';
import { Request } from 'express';
import { StatusCodes } from 'http-status-codes';
import { flatten, range, intersection } from 'lodash';
import mongoose from 'mongoose';
import { PeriodModel } from './entities';
import { periodDocumentTransformer } from './transformers';
import {
  PeriodDetailsDto,
  PeriodDto,
  PeriodQuantifierPraiseInput,
  PeriodReceiverPraiseInput,
  PeriodStatusType,
  PeriodUpdateInput,
  VerifyQuantifierPoolSizeResponse,
} from './types';
import { findPeriodDetailsDto, getPreviousPeriodEndDate } from './utils';
import { firstFit, PackingOutput } from 'bin-packer';

/**
 * Description
 * @param
 */
export const all = async (
  req: TypedRequestQuery<QueryInputParsedQs>,
  res: TypedResponse<PaginatedResponseBody<PeriodDetailsDto | undefined>>
): Promise<void> => {
  const query = getQueryInput(req.query);

  const response = await PeriodModel.paginate({
    ...query,
    sort: getQuerySort(req.query),
  });

  const periodList = response?.docs;
  if (periodList && Array.isArray(periodList) && periodList.length > 0) {
    const periodDetailsList: PeriodDetailsDto[] = [];
    for (const period of periodList) {
      if (period?.status === PeriodStatusType.QUANTIFY) {
        const periodDetails = await findPeriodDetailsDto(period._id);
        periodDetailsList.push(periodDetails);
        continue;
      }
      periodDetailsList.push(periodDocumentTransformer(period));
    }
    res.status(StatusCodes.OK).json({
      ...response,
      docs: periodDetailsList,
    });
  } else {
    res.status(StatusCodes.OK).json({
      ...response,
      docs: [],
    });
  }
};

/**
 * Description
 * @param
 */
export const single = async (
  req: Request,
  res: TypedResponse<PeriodDetailsDto>
): Promise<void> => {
  const { periodId } = req.params;
  const periodDetailsDto = await findPeriodDetailsDto(periodId);
  res.status(StatusCodes.OK).json(periodDetailsDto);
};

/**
 * Description
 * @param
 */
export const create = async (
  req: TypedRequestBody<PeriodUpdateInput>,
  res: TypedResponse<PeriodDto>
): Promise<void> => {
  const { name, endDate } = req.body;
  const period = await PeriodModel.create({ name, endDate });
  res.status(StatusCodes.OK).json(periodDocumentTransformer(period));
};

/**
 * Description
 * @param
 */
export const update = async (
  req: TypedRequestBody<PeriodUpdateInput>,
  res: TypedResponse<PeriodDto>
): Promise<void> => {
  const period = await PeriodModel.findById(req.params.periodId);
  if (!period) throw new NotFoundError('Period');

  const { name, endDate } = req.body;

  if (name) {
    period.name = name;
  }

  if (endDate) {
    const d = new Date(endDate);
    if (d.toString() === 'Invalid Date')
      throw new BadRequestError('Invalid date format.');
    period.endDate = d;
  }

  await period.save();

  const periodDetailsDto = await findPeriodDetailsDto(period._id);
  res.status(StatusCodes.OK).json(periodDetailsDto);
};

/**
 * Description
 * @param
 */
export const close = async (
  req: Request,
  res: TypedResponse<PeriodDto>
): Promise<void> => {
  const period = await PeriodModel.findById(req.params.periodId);
  if (!period) throw new NotFoundError('Period');

  period.status = PeriodStatusType.CLOSED;
  await period.save();

  res.status(StatusCodes.OK).json(periodDocumentTransformer(period));
};

const assignedPraiseCount = (quantifier: Quantifier): number => {
  return quantifier.receivers.reduce((sum, receiver) => {
    return sum + receiver.praiseCount;
  }, 0);
};

const assignsRemaining = (
  receivers: Receiver[],
  quantifiersPerPraiseReceiver: number
): boolean => {
  for (const r of receivers) {
    if (
      !r.assignedQuantifiers ||
      r.assignedQuantifiers < quantifiersPerPraiseReceiver
    ) {
      return true;
    }
  }
  return false;
};

const assignQuantifiersDryRun = async (
  periodId: string
): Promise<Array<Quantifier>> => {
  const period = await PeriodModel.findById(periodId);
  if (!period) throw new NotFoundError('Period');

  const quantifiersPerPraiseReceiver = await settingInt(
    'PRAISE_QUANTIFIERS_PER_PRAISE_RECEIVER'
  );
  const tolerance = 1.05;
  const praisePerQuantifier = await settingInt('PRAISE_PER_QUANTIFIER');

  if (!quantifiersPerPraiseReceiver || !tolerance || !praisePerQuantifier)
    throw new InternalServerError('Configuration error');

  const maxPraisePerQuantifier = praisePerQuantifier * tolerance;
  const previousPeriodEndDate = await getPreviousPeriodEndDate(period);

  // Query a list of receivers with their collection of praise
  let receivers: Receiver[] = await PraiseModel.aggregate([
    {
      $match: {
        createdAt: { $gte: previousPeriodEndDate, $lt: period.endDate },
      },
    },
    {
      $group: {
        _id: '$receiver',
        praiseCount: { $count: {} },
        praiseIds: {
          $push: '$_id',
        },
      },
    },

    // Sort decsending as first step of "First Fit Decreasing" bin-packing algorithm
    {
      $sort: {
        praiseCount: -1
      }
    }
  ]);

  // Run "First Fit" bin-packing algorithm on list of receivers
  //    with a maximum 'bin' size of: PRAISE_PER_QUANTIFIER * tolerance
  //    where each item takes up bin space based on its' praiseCount
  const result: PackingOutput<Receiver> = firstFit(receivers, (r: Receiver) => r.praiseCount, maxPraisePerQuantifier);
  //@ts-ignore
  const bins: Receiver[][] = [...result.bins, ...result.oversized];

  // Clone the bins for each redundant assignment (as defined by setting PRAISE_QUANTIFIERS_PER_PRAISE_RECEIVER)
  //@ts-ignore
  const redundantAssignmentBins: Receiver[][] = flatten(range(quantifiersPerPraiseReceiver).map((i) => bins.slice()))

  // Query the list of quantifiers & randomize order
  let quantifierPool = await UserModel.aggregate([
    { $match: { roles: UserRole.QUANTIFIER } },
    {
      $lookup: {
        from: 'useraccounts',
        localField: '_id',
        foreignField: 'user',
        as: 'accounts',
      },
    },
    {
      $addFields: {
        receivers: []
      }
    }
  ]);
  quantifierPool = quantifierPool.sort(() => 0.5 - Math.random()).slice(0, quantifierPool.length);

  // Convert array of quantifiers to a single object, keyed by _id
  const quantifierPoolById: QuantifierPoolById = quantifierPool.reduce(
    (poolById, q) => {
      poolById[q._id] = q;
      return poolById;
    },
    {}
  );

  // Assign each bin to an available quantifier
  const availableQuantifiers = quantifierPool.slice();
  let quantifiersNeeded = 0;
  redundantAssignmentBins.forEach((assignmentBin: Receiver[]) => {
    if (availableQuantifiers.length === 0) {
      quantifiersNeeded += 1;
      return;
    }

    const q = availableQuantifiers.pop();
    const qUserAccountIds: string[] = q.accounts.map((account: UserAccountDocument) =>
      account._id.toString()
    );
    const assignmentReceiverIds: string[] = assignmentBin.map((r: Receiver) =>
      r._id.toString()
    );

    // Confirm none of the Receivers in the assignment bin belong to the Quantifier
    const overlappingUserAccounts = intersection(qUserAccountIds, assignmentReceiverIds);
    if (overlappingUserAccounts.length === 0) {
      // assign Quantifier to original pool
      quantifierPoolById[q._id.toString()].receivers.push(...assignmentBin);
    } else {
      // make quantifier available for assignment elsewhere
      availableQuantifiers.unshift(q);
    }
  });

  // Convert object of quantifiers back to array & remove any unassigned
  const poolAssignments: Quantifier[] = Object.values(quantifierPoolById)
    .filter((q: Quantifier): boolean => q.receivers.length > 0);

  // Extend the pool with dummy quantifiers if assigns remain to be done
  //  and no more quantifiers are available
  const neededAssignments: Quantifier[] = range(quantifiersNeeded).map((i) => ({
    _id: undefined,
    accounts: [],
    receivers: []
  }));

  const finalAssignments: Quantifier[] = poolAssignments.concat(neededAssignments);

  return finalAssignments;
};

/**
 * Description
 * @param
 */
export const verifyQuantifierPoolSize = async (
  req: Request,
  res: TypedResponse<VerifyQuantifierPoolSizeResponse>
): Promise<void> => {
  const quantifierPool = await UserModel.find({ roles: UserRole.QUANTIFIER });
  const assignedQuantifiers = await assignQuantifiersDryRun(
    req.params.periodId
  );

  res.status(StatusCodes.OK).json({
    quantifierPoolSize: quantifierPool.length,
    requiredPoolSize: assignedQuantifiers.length,
  });
};

/**
 * Description
 * @param
 */
export const assignQuantifiers = async (
  req: Request,
  res: TypedResponse<PeriodDetailsDto>
): Promise<void> => {
  const { periodId } = req.params;
  const period = await PeriodModel.findById(periodId);
  if (!period) throw new NotFoundError('Period');
  if (period.status !== 'OPEN')
    throw new BadRequestError(
      'Quantifiers can only be assigned on OPEN periods.'
    );

  const assignedQuantifiers = await assignQuantifiersDryRun(
    req.params.periodId
  );

  // Undefined quantifers means pool size is too small
  if (assignedQuantifiers.find((q) => typeof q._id === 'undefined'))
    throw new BadRequestError('Quantifier pool size too small.');

  // Generate list of db queries to apply changes specified by assignedQuantifiers
  const bulkQueries = flatten(
    assignedQuantifiers.map((q) =>
      q.receivers.map((receiver) => ({
        updateMany: {
          filter: { _id: { $in: receiver.praiseIds } },
          update: {
            $push: {
              quantifications: {
                quantifier: q._id,
                score: 0,
                dismissed: false,
              },
            },
          },
        },
      }))
    )
  );

  await PraiseModel.bulkWrite(bulkQueries);

  period.status = PeriodStatusType.QUANTIFY;
  await period.save();

  const periodDetailsDto = await findPeriodDetailsDto(periodId);
  res.status(StatusCodes.OK).json(periodDetailsDto);
};

/**
 * Description
 * @param
 */
export const receiverPraise = async (
  req: TypedRequestQuery<PeriodReceiverPraiseInput>,
  // req: Request,
  res: TypedResponse<PraiseDto[]>
): Promise<void> => {
  const period = await PeriodModel.findById(req.params.periodId);
  if (!period) throw new NotFoundError('Period');

  const { receiverId } = req.query;
  if (!receiverId) throw new BadRequestError('Receiver Id is a required field');

  const previousPeriodEndDate = await getPreviousPeriodEndDate(period);

  const praiseList = await PraiseModel.find()
    .where({
      createdAt: { $gte: previousPeriodEndDate, $lt: period.endDate },
      receiver: new mongoose.Types.ObjectId(receiverId),
    })
    .sort({ createdAt: -1 })
    .populate('receiver giver');

  const praiseDetailsDtoList: PraiseDetailsDto[] = [];
  if (praiseList) {
    for (const praise of praiseList) {
      praiseDetailsDtoList.push(await praiseWithScore(praise));
    }
  }

  res.status(StatusCodes.OK).json(praiseDetailsDtoList);
};

/**
 * Description
 * @param
 */
export const quantifierPraise = async (
  req: TypedRequestQuery<PeriodQuantifierPraiseInput>,
  // req: Request,
  res: TypedResponse<PraiseDto[]>
): Promise<void> => {
  const period = await PeriodModel.findById(req.params.periodId);
  if (!period) throw new NotFoundError('Period');

  const { quantifierId } = req.query;
  if (!quantifierId)
    throw new BadRequestError('Quantifier Id is a required field');

  const previousPeriodEndDate = await getPreviousPeriodEndDate(period);

  const praiseList = await PraiseModel.aggregate([
    {
      $match: {
        createdAt: { $gte: previousPeriodEndDate, $lt: period.endDate },
      },
    },
    { $unwind: '$quantifications' },
    {
      $match: {
        $expr: {
          $eq: [
            '$quantifications.quantifier',
            new mongoose.Types.ObjectId(quantifierId),
          ],
        },
      },
    },
  ]);

  await PraiseModel.populate(praiseList, { path: 'receiver giver' });

  const response = await praiseDocumentListTransformer(praiseList);
  res.status(StatusCodes.OK).json(response);
};
