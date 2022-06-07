import {
  InternalServerError,
  BadRequestError,
  NotFoundError,
} from '@error/errors';
import { Quantifier, QuantifierPoolById, Receiver } from '@praise/types';
import { UserModel } from '@user/entities';
import { settingValue } from '@shared/settings';
import { TypedResponse } from '@shared/types';
import { UserRole } from '@user/types';
import { UserAccountDocument } from '@useraccount/types';
import { PraiseModel } from '@praise/entities';
import { EventLogTypeKey } from '@eventlog/types';
import { logEvent } from '@eventlog/utils';
import { firstFit, PackingOutput } from 'bin-packer';
import logger from 'jet-logger';
import { flatten, intersection, range, sum } from 'lodash';
import { StatusCodes } from 'http-status-codes';
import { Request } from 'express';
import {
  AssignQuantifiersDryRunOutput,
  PeriodDetailsDto,
  PeriodStatusType,
  VerifyQuantifierPoolSizeResponse,
} from '../types';
import {
  findPeriodDetailsDto,
  getPreviousPeriodEndDate,
  verifyAnyPraiseAssigned,
} from '../utils';
import { PeriodModel } from '../entities';

const assignQuantifiersDryRun = async (
  periodId: string
): Promise<AssignQuantifiersDryRunOutput> => {
  const period = await PeriodModel.findById(periodId);
  if (!period) throw new NotFoundError('Period');

  const quantifiersPerPraiseReceiver = (await settingValue(
    'PRAISE_QUANTIFIERS_PER_PRAISE_RECEIVER',
    period._id
  )) as number;
  const praisePerQuantifier = (await settingValue(
    'PRAISE_PER_QUANTIFIER',
    period._id
  )) as number;
  const quantifiersAssignedEvenly = (await settingValue(
    'PRAISE_QUANTIFIERS_ASSIGN_ALL',
    period._id
  )) as boolean;
  const tolerance = 1.2;

  if (!quantifiersPerPraiseReceiver || !praisePerQuantifier)
    throw new InternalServerError('Configuration error');

  const previousPeriodEndDate = await getPreviousPeriodEndDate(period);

  // Determine target bin size
  let targetBinSize = 0;
  if (quantifiersAssignedEvenly) {
    const praisesCount = await PraiseModel.find({
      createdAt: { $gt: previousPeriodEndDate, $lte: period.endDate },
    }).count();
    const quantifiersCount = await UserModel.find({
      roles: UserRole.QUANTIFIER,
    }).count();

    targetBinSize = Math.ceil(
      ((praisesCount * quantifiersPerPraiseReceiver) / quantifiersCount) *
        tolerance
    );
  } else {
    targetBinSize = Math.ceil(praisePerQuantifier * tolerance);
  }

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

  // Clone the list of recievers for each redundant assignment
  //  (as defined by setting PRAISE_QUANTIFIERS_PER_PRAISE_RECEIVER)
  const redundantAssignmentBins: Receiver[][] = flatten(
    range(quantifiersPerPraiseReceiver).map(() => {
      // Run "first Fit" randomized bin-packing algorithm on list of receivers
      //    with a maximum 'bin' size of: PRAISE_PER_QUANTIFIER
      //    where each item takes up bin space based on its' praiseCount
      const receiversShuffled = receivers
        .sort(() => 0.5 - Math.random())
        .slice(0, receivers.length);

      const result: PackingOutput<Receiver> = firstFit(
        receiversShuffled,
        (r: Receiver) => r.praiseCount,
        targetBinSize
      );

      const bins: Receiver[][] = [
        ...result.bins,
        ...result.oversized.map((r) => [r]),
      ];

      return bins;
    })
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

  // Convert array of quantifiers to a single object, keyed by _id
  const quantifierPoolById: QuantifierPoolById = quantifierPool.reduce(
    (poolById, q) => {
      poolById[q._id] = q;
      return poolById;
    },
    {}
  );

  // Assign each quantifier to an available bin
  //  or Assign each bin to an available quantifier
  const availableQuantifiers = quantifierPool.slice();
  const availableBins = redundantAssignmentBins.slice();

  const skippedAssignmentBins: Receiver[][] = [];
  const skippedAssignmentOptionIds: string[] = [];

  while (availableBins.length > 0) {
    const assignmentBin: Receiver[] | undefined = availableBins.pop();
    if (!assignmentBin) continue;

    if (availableQuantifiers.length === 0) {
      skippedAssignmentBins.push(assignmentBin);
      continue;
    }

    const q = availableQuantifiers.pop();

    // Generate a unique id to reference this assignment option (bin + quantifier)
    const assignmentBinId: string = flatten(
      assignmentBin.map((r: Receiver) => r.praiseIds)
    ).join('+');
    const assignmentOptionId = `${
      q._id.toString() as string
    }-${assignmentBinId}`;

    const qUserAccountIds: string[] = q.accounts.map(
      (account: UserAccountDocument) => account._id.toString()
    );
    const assignmentReceiverIds: string[] = assignmentBin.map((r: Receiver) =>
      r._id.toString()
    );

    // Confirm none of the Receivers in the assignment bin belong to the Quantifier
    const overlappingUserAccounts = intersection(
      qUserAccountIds,
      assignmentReceiverIds
    );
    if (overlappingUserAccounts.length === 0) {
      // assign Quantifier to original pool
      quantifierPoolById[q._id.toString()].receivers.push(...assignmentBin);
    } else if (skippedAssignmentOptionIds.includes(assignmentOptionId)) {
      // this assignment option has been skipped before
      //  mark it as un-assignable by the current quantiifer set
      skippedAssignmentBins.push(assignmentBin);
    } else {
      // this assignment option has not been skipped yet
      // make quantifier available again, at end of the line
      availableQuantifiers.unshift(q);

      // make bin available again, at the beginning of the line
      availableBins.push(assignmentBin);

      // note that this assignment option has been skipped once
      skippedAssignmentOptionIds.push(assignmentOptionId);
    }
  }

  // Convert object of quantifiers back to array & remove any unassigned
  const poolAssignments: Quantifier[] = Object.values<Quantifier>(
    quantifierPoolById
  ).filter((q: Quantifier): boolean => q.receivers.length > 0);

  // Extend the pool with dummy quantifiers if assigns remain to be done
  //  and no more quantifiers are available
  const neededAssignments: Quantifier[] = skippedAssignmentBins.map((bin) => ({
    _id: undefined,
    accounts: [],
    receivers: [...bin],
  }));

  poolAssignments.push(...neededAssignments);

  // Verify that all quantifiers were assigned if necessary
  if (quantifiersAssignedEvenly) {
    if (poolAssignments.length === quantifierPool.length) {
      logger.info(
        'All quantifiers were assigned praise, as expected with PRAISE_QUANTIFIERS_ASSIGN_EVENLY'
      );
    } else {
      throw new InternalServerError(
        `Not all quantifiers were assigned praise, missing ${neededAssignments.length}, despite PRAISE_QUANTIFIERS_ASSIGN_EVENLY`
      );
    }
  }

  // Verify & log that all praise is accounted for in this model
  const totalPraiseCount: number = await PraiseModel.count({
    createdAt: { $gt: previousPeriodEndDate, $lte: period.endDate },
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

  return {
    poolAssignments,
    poolDeficit: neededAssignments.length,
  };
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
  const assignmentDryRun: AssignQuantifiersDryRunOutput =
    await assignQuantifiersDryRun(req.params.periodId);

  res.status(StatusCodes.OK).json({
    quantifierPoolSize,
    quantifierPoolSizeNeeded: assignmentDryRun.poolAssignments.length,
    quantifierPoolDeficitSize: assignmentDryRun.poolDeficit,
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

  const anyPraiseAssigned = await verifyAnyPraiseAssigned(period);
  if (anyPraiseAssigned)
    throw new BadRequestError(
      'Some praise has already been assigned for this period'
    );

  const assignedQuantifiers: AssignQuantifiersDryRunOutput =
    await assignQuantifiersDryRun(req.params.periodId);

  if (assignedQuantifiers.poolDeficit > 0)
    throw new BadRequestError(
      `Failed to assign ${assignedQuantifiers.poolDeficit} collection of praise to a quantifier`
    );

  // Generate list of db queries to apply changes specified by assignedQuantifiers
  const bulkQueries = flatten(
    assignedQuantifiers.poolAssignments.map((q) =>
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
  await PeriodModel.updateOne(
    { _id: period._id },
    { $set: { status: PeriodStatusType.QUANTIFY } }
  );

  await logEvent(
    EventLogTypeKey.PERIOD,
    `Assigned random quantifiers to all praise in period "${period.name}"`,
    {
      userId: res.locals.currentUser._id,
    }
  );

  const periodDetailsDto = await findPeriodDetailsDto(periodId);
  res.status(StatusCodes.OK).json(periodDetailsDto);
};
