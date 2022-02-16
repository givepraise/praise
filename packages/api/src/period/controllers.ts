import { PraiseModel } from '@praise/entities';
import {
  BadRequestError,
  InternalServerError,
  NotFoundError,
} from '@shared/errors';
import { getQuerySort } from '@shared/functions';
import { settingFloat, settingInt } from '@shared/settings';
import {
  PaginatedResponseBody,
  QueryInputParsedQs,
  TypedRequestBody,
  TypedRequestQuery,
  TypedResponse,
} from '@shared/types';
import { UserModel } from '@user/entities';
import { UserRole } from '@user/types';
import { Request } from 'express';
import { StatusCodes } from 'http-status-codes';
import { PeriodModel } from './entities';
import {
  periodDetailsReceiverListTransformer,
  periodDocumentListTransformer,
  periodDocumentTransformer,
} from './transformers';
import {
  Period,
  PeriodCreateUpdateInput,
  PeriodDetailsDto,
  PeriodDetailsQuantifierDto,
  PeriodDetailsReceiver,
  PeriodDto,
  PeriodStatusType,
  VerifyQuantifierPoolSizeResponse,
} from './types';

// Returns previous period end date or 1970-01-01 if no previous period
const getPreviousPeriodEndDate = async (period: Period): Promise<Date> => {
  const previousPeriod = await PeriodModel.findOne({
    endDate: { $lt: period.endDate },
  }).sort({ endDate: -1 });

  const previousEndDate = previousPeriod
    ? previousPeriod.endDate
    : new Date(+0);

  return previousEndDate;
};

/**
 * Description
 * @param
 */
export const all = async (
  req: TypedRequestQuery<QueryInputParsedQs>,
  res: TypedResponse<PaginatedResponseBody<PeriodDto | undefined>>
): Promise<void> => {
  const response = await PeriodModel.paginate({
    ...req.query,
    sort: getQuerySort(req.query),
  });

  res.status(StatusCodes.OK).json({
    ...response,
    docs: periodDocumentListTransformer(response?.docs),
  });
};

const calculateReceiverScores = async (
  receivers: PeriodDetailsReceiver[]
): Promise<PeriodDetailsReceiver[]> => {
  const duplicatePraisePercentage = await settingFloat(
    'PRAISE_QUANTIFY_DUPLICATE_PRAISE_PERCENTAGE'
  );
  if (!duplicatePraisePercentage)
    throw new BadRequestError(
      "Invalid setting 'PRAISE_QUANTIFY_DUPLICATE_PRAISE_PERCENTAGE'"
    );

  for (const r of receivers) {
    let score = 0;
    if (!r.quantifications) continue;
    for (const quantification of r.quantifications) {
      let si = 0;
      let s = 0;
      for (const qi of quantification) {
        if (qi.score > 0) {
          s += qi.score;
          si++;
        }
        if (qi.duplicatePraise) {
          const p = await PraiseModel.findById(qi.duplicatePraise);
          if (p) {
            for (const pq of p.quantifications) {
              if (
                pq?.quantifier &&
                qi.quantifier &&
                pq.quantifier.equals(qi.quantifier) &&
                pq.score > 0
              ) {
                s += pq.score * duplicatePraisePercentage;
                si++;
              }
            }
          }
        }
      }
      if (s > 0) {
        score += Math.floor(s / si);
      }
    }
    r.score = score;
    delete r.quantifications;
  }
  return receivers;
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
  const period = await PeriodModel.findById(periodId);
  if (!period) throw new NotFoundError('Period');

  const previousPeriodEndDate = await getPreviousPeriodEndDate(period);

  const quantifier: PeriodDetailsQuantifierDto[] = await PraiseModel.aggregate([
    {
      $match: {
        createdAt: { $gte: previousPeriodEndDate, $lt: period.endDate },
      },
    },
    { $unwind: '$quantifications' },
    {
      $addFields: {
        finished: {
          $or: [
            { $ne: ['$quantifications.dismissed', false] },
            { $gt: ['$quantifications.score', 0] },
            { $ne: ['$quantifications.duplicatePraise', null] },
          ],
        },
      },
    },
    {
      $group: {
        _id: '$quantifications.quantifier',
        praiseCount: { $count: {} },
        finishedCount: { $sum: { $toInt: '$finished' } },
      },
    },
  ]);

  const receivers: PeriodDetailsReceiver[] = await PraiseModel.aggregate([
    {
      $match: {
        createdAt: { $gte: previousPeriodEndDate, $lt: period.endDate },
      },
    },
    {
      $lookup: {
        from: 'useraccounts',
        localField: 'receiver',
        foreignField: '_id',
        as: 'userAccounts',
      },
    },
    {
      $group: {
        _id: '$receiver',
        praiseCount: { $count: {} },
        quantifications: {
          $push: '$quantifications',
        },
        userAccounts: { $first: '$userAccounts' },
      },
    },
  ]);

  await calculateReceiverScores(receivers);

  const response = {
    ...periodDocumentTransformer(period),
    receivers: periodDetailsReceiverListTransformer(receivers),
    quantifiers: [...quantifier],
  };
  res.status(StatusCodes.OK).json(response);
};

/**
 * Description
 * @param
 */
export const create = async (
  req: TypedRequestBody<PeriodCreateUpdateInput>,
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
  req: TypedRequestBody<PeriodCreateUpdateInput>,
  res: TypedResponse<PeriodDto>
): Promise<void> => {
  const period = await PeriodModel.findById(req.params.periodId);
  if (!period) throw new NotFoundError('Period');

  const { name, endDate } = req.body;

  if (name) {
    period.name = req.body.name;
  }

  if (endDate) {
    const d = new Date(req.body.endDate);
    if (d.toString() === 'Invalid Date')
      throw new BadRequestError('Invalid date format.');
    period.endDate = d;
  }

  await period.save();

  res.status(StatusCodes.OK).json(periodDocumentTransformer(period));
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

interface Receiver {
  _id: string;
  praiseCount: number;
  praiseIds: string[];
  assignedQuantifiers?: number;
}

interface Quantifier {
  _id?: string;
  receivers: Receiver[];
}

const assignQuantifiersDryRun = async (
  periodId: string
): Promise<Array<Quantifier>> => {
  const period = await PeriodModel.findById(periodId);
  if (!period) throw new NotFoundError('Period');

  const previousPeriodEndDate = await getPreviousPeriodEndDate(period);

  // Aggregate all period praise receivers and count number of received praise
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
  ]);

  const quantifierPool = await UserModel.find({ roles: UserRole.QUANTIFIER });
  const poolIds: Quantifier[] = quantifierPool.map(
    (user) => ({ _id: user._id, receivers: [] } as Quantifier)
  );
  // Scramble the quant pool to randomize who gets assigned
  const pool = poolIds.sort(() => 0.5 - Math.random()).slice(0, poolIds.length);

  const quantifiersPerPraiseReceiver = await settingInt(
    'PRAISE_QUANTIFIERS_PER_PRAISE_RECEIVER'
  );
  const tolerance = 1.05;
  const praisePerQuantifier = await settingInt('PRAISE_PER_QUANTIFIER');

  if (!quantifiersPerPraiseReceiver || !tolerance || !praisePerQuantifier)
    throw new InternalServerError('Configuration error');

  const maxPraisePerQuantifier = praisePerQuantifier * tolerance;

  for (let qi = 0; qi < pool.length; qi++) {
    const q = pool[qi];

    // Scramble receivers array to avoid same combinations of receivers being
    // assigned to quantifiers.
    receivers = receivers
      .sort(() => 0.5 - Math.random())
      .slice(0, receivers.length);

    for (let ri = 0; ri < receivers.length; ri++) {
      const r = receivers[ri];

      // Quantify your own received praise not allowed
      if (r._id.toString() === q._id?.toString()) {
        continue;
      }

      // Assign praise that meet criteria
      if (
        (q.receivers.length === 0 && r.praiseCount >= praisePerQuantifier) ||
        assignedPraiseCount(q) + r.praiseCount < maxPraisePerQuantifier
      ) {
        // Assign receiver to quantifier
        q.receivers.push(r);
        r.assignedQuantifiers = r.assignedQuantifiers
          ? r.assignedQuantifiers + 1
          : 1;
        // No more assigns needed for this receiver, splice from receiver array
        if (r.assignedQuantifiers === quantifiersPerPraiseReceiver) {
          receivers.splice(ri, 1);
          ri--;
        }
      }
    }

    const assignsRemaining = (): boolean => {
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

    // Extend the pool with dummy quantifiers if assigns remain to be done
    // when reaching the end of the pool
    if (qi === pool.length - 1 && assignsRemaining()) {
      pool.push({
        receivers: [],
      });
    }
  }

  // Trim any unassigned quantifiers from the returned pool
  while (pool[pool.length - 1].receivers.length === 0) {
    pool.pop();
  }

  return pool;
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

  // Quantifiers
  for (const q of assignedQuantifiers) {
    const quantifier = await UserModel.findById(q._id);
    // Receivers
    for (const receiver of q.receivers) {
      // Praise
      for (const praiseId of receiver.praiseIds) {
        const praise = await PraiseModel.findById(praiseId);
        if (quantifier && praise) {
          praise.quantifications.push({
            quantifier,
            score: 0,
            dismissed: false,
          });
          await praise.save();
        }
      }
    }
  }

  period.status = PeriodStatusType.QUANTIFY;
  await period.save();

  void single(req, res);
};

// /**
//  * Description
//  * @param
//  */
//  export const praise = async (
//   req: Request,
//   res: TypedResponse<Praise[]>
// ): Promise<void> => {
//   const period = await PeriodModel.findById(req.params.periodId);
//   if (!period) throw new NotFoundError('Period');

//   const previousPeriodEndDate = await getPreviousPeriodEndDate(period);

//   const praise = await PraiseModel.find()
//     .where({
//       createdAt: { $gte: previousPeriodEndDate, $lt: period.endDate },
//     })
//     .sort({ createdAt: -1 })
//     .populate('receiver giver');

//   res.status(StatusCodes.OK).json(praise);
// };
