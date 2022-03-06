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
import { firstFit, PackingOutput } from 'bin-packer';
import { Request } from 'express';
import { StatusCodes } from 'http-status-codes';
import logger from 'jet-logger';
import { flatten, intersection, range, sum } from 'lodash';
import mongoose from 'mongoose';
import { AssignResult, maxWeightAssign } from 'munkres-algorithm';
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

  const maxPraisePerQuantifier = Math.ceil(praisePerQuantifier * tolerance);
  const previousPeriodEndDate = await getPreviousPeriodEndDate(period);

  // Query a list of receivers with their collection of praise
  const receivers: Receiver[] = await PraiseModel.aggregate([
    {
      $match: {
        createdAt: { $gt: previousPeriodEndDate, $lte: period.endDate },
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
        praiseCount: -1,
      },
    },
  ]);

  // Run "First Fit" bin-packing algorithm on list of receivers
  //    with a maximum 'bin' size of: PRAISE_PER_QUANTIFIER * tolerance
  //    where each item takes up bin space based on its' praiseCount
  const result: PackingOutput<Receiver> = firstFit(
    receivers,
    (r: Receiver) => r.praiseCount,
    maxPraisePerQuantifier
  );
  const bins: Receiver[][] = [
    ...result.bins,
    ...result.oversized.map((r) => [r]),
  ];

  // Clone the bins for each redundant assignment (as defined by setting PRAISE_QUANTIFIERS_PER_PRAISE_RECEIVER)
  const redundantAssignmentBins: Receiver[][] = flatten(
    range(quantifiersPerPraiseReceiver).map(() => bins.slice())
  );

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
        receivers: [],
      },
    },
  ]);
  quantifierPool = quantifierPool
    .sort(() => 0.5 - Math.random())
    .slice(0, quantifierPool.length);

  // Prepare a matrix for use by the restricted "Hungarian Assignment" algorithm
  //    each column represents an element in redundantAssignmentBins
  //    each row represents a Quantifier
  //    the value represents the weight of selecting that assignment: either Infinity (permitted assignment) or - Infinity (forbidden assignment)
  const assignmentOptionsMatrix: number[][] = redundantAssignmentBins.map(
    (bin) =>
      quantifierPool.map((q) => {
        const qUserAccountIds: string[] = q.accounts.map(
          (account: UserAccountDocument) => account._id.toString()
        );
        const receiverIds: string[] = bin.map((r: Receiver) =>
          r._id.toString()
        );

        // Confirm quantifier can be assigned to this bin
        //  i.e. none of the Receivers in the assignment bin belong to the Quantifier
        const intersectionUserAccounts: string[] = intersection(
          qUserAccountIds,
          receiverIds
        );

        if (intersectionUserAccounts.length === 0) {
          return Infinity;
        } else {
          return -Infinity;
        }
      })
  );

  // Generate assignment instructions using a restricted "Hungarian Assignment" algorithm
  const assignResult: AssignResult = maxWeightAssign(assignmentOptionsMatrix);

  // Transform assignments to final format
  const poolAssignments: Quantifier[] = assignResult.assignments.map(
    (qIndex: number | null, binIndex: number) => {
      const bin = redundantAssignmentBins[binIndex];

      if (qIndex === null) {
        return {
          _id: undefined,
          accounts: [],
          receivers: [...bin],
        };
      } else {
        const q = quantifierPool[qIndex];

        return {
          ...q,
          receivers: q.receivers.concat(...bin),
        };
      }
    }
  );

  // Verify & log that all praise is accounted for in this model
  const totalPraiseCount: number = await PraiseModel.count({
    createdAt: { $gte: previousPeriodEndDate, $lt: period.endDate },
  });
  const expectedAssignedPraiseCount: number =
    totalPraiseCount * quantifiersPerPraiseReceiver;

  const assignedPraiseCount: number = sum(
    flatten(
      poolAssignments.map((q: Quantifier) =>
        q.receivers.map((r: Receiver) => r.praiseIds.length)
      )
    )
  );

  if (assignedPraiseCount === expectedAssignedPraiseCount) {
    logger.info(
      `All redundant praise assignments accounted for: ${assignedPraiseCount} assignments / ${expectedAssignedPraiseCount} expected in period`
    );
  } else {
    throw new InternalServerError(
      `Not all redundant praise assignments accounted for: ${assignedPraiseCount} assignments / ${expectedAssignedPraiseCount} expected in period`
    );
  }

  return poolAssignments;
};

/**
 * Description
 * @param
 */
export const verifyQuantifierPoolSize = async (
  req: Request,
  res: TypedResponse<VerifyQuantifierPoolSizeResponse>
): Promise<void> => {
  const quantifierPoolSize = await UserModel.count({
    roles: UserRole.QUANTIFIER,
  });
  const assignedQuantifiers = await assignQuantifiersDryRun(
    req.params.periodId
  );
  const dummyQuantifiers: Quantifier[] = assignedQuantifiers.filter(
    (q) => q._id === undefined
  );

  res.status(StatusCodes.OK).json({
    quantifierPoolSize,
    quantifierPoolSizeNeeded: assignedQuantifiers.length,
    quantifierPoolDeficitSize: dummyQuantifiers.length,
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
      createdAt: { $gt: previousPeriodEndDate, $lte: period.endDate },
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
        createdAt: { $gt: previousPeriodEndDate, $lte: period.endDate },
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
