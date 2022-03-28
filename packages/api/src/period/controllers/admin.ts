import {
  BadRequestError,
  InternalServerError,
  NotFoundError,
} from '@error/errors';
import { PraiseModel } from '@praise/entities';
import {
  Quantifier,
  QuantifierPoolById,
  Receiver,
  PraiseDtoExtended,
  PraiseDetailsDto,
} from '@praise/types';
import { calculateDuplicateScore } from '@praise/transformers';
import { praiseWithScore } from '@praise/utils';
import { UserModel } from '@user/entities';
import { UserAccountModel } from '@useraccount/entities';
import {
  getPeriodDateRangeQuery,
  findPeriodDetailsDto,
  getPreviousPeriodEndDate,
  insertNewPeriodSettings,
} from '@period/utils';
import { settingInt } from '@shared/settings';
import { TypedRequestBody, TypedResponse, QueryInput } from '@shared/types';
import { UserRole } from '@user/types';
import { UserAccountDocument } from '@useraccount/types';
import { firstFit, PackingOutput } from 'bin-packer';
import logger from 'jet-logger';
import { flatten, intersection, range, sum } from 'lodash';
import { StatusCodes } from 'http-status-codes';
import { Request, Response } from 'express';
import { Parser } from 'json2csv';
import {
  AssignQuantifiersDryRunOutput,
  PeriodDetailsDto,
  PeriodDto,
  PeriodStatusType,
  PeriodUpdateInput,
  VerifyQuantifierPoolSizeResponse,
} from '../types';
import { PeriodModel } from '../entities';
import { periodDocumentTransformer } from '../transformers';

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
  await insertNewPeriodSettings(period);
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
): Promise<AssignQuantifiersDryRunOutput> => {
  const period = await PeriodModel.findById(periodId);
  if (!period) throw new NotFoundError('Period');

  const quantifiersPerPraiseReceiver = await settingInt(
    'PRAISE_QUANTIFIERS_PER_PRAISE_RECEIVER',
    period._id
  );
  const praisePerQuantifier = await settingInt(
    'PRAISE_PER_QUANTIFIER',
    period._id
  );
  const tolerance = 1.2;

  if (!quantifiersPerPraiseReceiver || !praisePerQuantifier)
    throw new InternalServerError('Configuration error');

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
        praisePerQuantifier * tolerance
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

  // Assign each bin to an available quantifier
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

  period.status = PeriodStatusType.QUANTIFY;
  await period.save();

  const periodDetailsDto = await findPeriodDetailsDto(periodId);
  res.status(StatusCodes.OK).json(periodDetailsDto);
};

/**
 * //TODO add descriptiom
 */
export const exportPraise = async (
  req: TypedRequestBody<QueryInput>,
  res: Response
): Promise<void> => {
  const period = await PeriodModel.findOne({ _id: req.params.periodId });
  if (!period) throw new NotFoundError('Period');
  const periodDateRangeQuery = await getPeriodDateRangeQuery(period);

  const praises = await PraiseModel.find({
    createdAt: periodDateRangeQuery,
  }).populate('giver receiver');

  const quantificationsColumnsCount = parseInt(
    String(process.env.PRAISE_QUANTIFIERS_PER_PRAISE_RECEIVER)
  );

  const docs: PraiseDetailsDto[] = [];
  if (praises) {
    for (const praise of praises) {
      const pws: PraiseDtoExtended = await praiseWithScore(praise);

      const receiver = await UserModel.findById(pws.receiver.user);
      if (receiver) {
        pws.receiverUserDocument = receiver;
      }

      if (pws.giver && pws.giver.user) {
        const giver = await UserModel.findById(pws.giver.user);
        if (giver) {
          pws.giverUserDocument = giver;
        }
      }

      pws.quantifications = await Promise.all(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        pws.quantifications.map(async (q: any) => {
          const quantifier = await UserModel.findById(q.quantifier._id);
          const account = await UserAccountModel.findOne({
            user: q.quantifier._id,
          });

          q.quantifier = quantifier;
          q.account = account;

          if (q.duplicatePraise) {
            const praise = await PraiseModel.findById(q.duplicatePraise._id);
            if (praise && praise.quantifications) {
              const quantification = praise.quantifications.find((q) =>
                q.quantifier.equals(q.quantifier)
              );
              if (quantification) {
                q.score = quantification.dismissed
                  ? 0
                  : await calculateDuplicateScore(quantification, period._id);
              }
            }
          }

          return q;
        })
      );

      docs.push(pws);
    }
  }

  const fields = [
    {
      label: 'ID',
      value: '_id',
    },
    {
      label: 'DATE',
      value: 'createdAt',
    },
    {
      label: 'TO USER ACCOUNT',
      value: 'receiver.name',
    },
    {
      label: 'TO ETH ADDRESS',
      value: 'receiverUserDocument.ethereumAddress',
    },
    {
      label: 'FROM USER ACCOUNT',
      value: 'giver.name',
    },
    {
      label: 'FROM ETH ADDRESS',
      value: 'giverUserDocument.ethereumAddress',
    },
    {
      label: 'REASON',
      value: 'reason',
    },
    {
      label: 'SOURCE ID',
      value: 'sourceId',
    },
    {
      label: 'SOURCE NAME',
      value: 'sourceName',
    },
  ];

  for (let index = 0; index < quantificationsColumnsCount; index++) {
    const quantObj = {
      label: `SCORE ${index + 1}`,
      value: `quantifications[${index}].score`,
    };

    fields.push(quantObj);
  }

  for (let index = 0; index < quantificationsColumnsCount; index++) {
    const quantObj = {
      label: `DUPLICATE ID ${index + 1}`,
      value: `quantifications[${index}].duplicatePraise`,
    };

    fields.push(quantObj);
  }

  for (let index = 0; index < quantificationsColumnsCount; index++) {
    const quantObj = {
      label: `DISMISSED ${index + 1}`,
      value: `quantifications[${index}].dismissed`,
    };

    fields.push(quantObj);
  }

  for (let index = 0; index < quantificationsColumnsCount; index++) {
    const quantUserUsernameObj = {
      label: `QUANTIFIER ${index + 1} USERNAME`,
      value: `quantifications[${index}].account.name`,
    };

    fields.push(quantUserUsernameObj);

    const quantUserEthAddressObj = {
      label: `QUANTIFIER ${index + 1} ETH ADDRESS`,
      value: `quantifications[${index}].quantifier.ethereumAddress`,
    };

    fields.push(quantUserEthAddressObj);
  }

  fields.push({
    label: 'AVG SCORE',
    value: 'score',
  });

  const json2csv = new Parser({ fields: fields });
  const csv = json2csv.parse(docs);

  res.attachment('data.csv');
  res.status(200).send(csv);
};
