import { PraiseModel } from '@praise/entities';
import { Praise } from '@praise/types';
import {
  BadRequestError,
  InternalServerError,
  NotFoundError,
} from '@shared/errors';
import { getQuerySort } from '@shared/functions';
import { QueryInput } from '@shared/inputs';
import { settingInt } from '@shared/settings';
import {
  PaginatedResponseBody,
  TypedRequestBody,
  TypedRequestQuery,
  TypedResponse,
} from '@shared/types';
import { UserModel } from '@user/entities';
import { UserRole } from '@user/types';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { PeriodModel } from './entities';
import { Period, PeriodCreateUpdateInput, Quantifier, Receiver } from './types';

export const all = async (
  req: TypedRequestQuery<QueryInput>,
  res: TypedResponse<PaginatedResponseBody<Period>>
): Promise<void> => {
  const response = await PeriodModel.paginate({
    ...req.query,
    sort: getQuerySort(req.query),
  });
  res.status(StatusCodes.OK).json(response);
};

export const single = async (
  req: Request,
  res: TypedResponse<Period>
): Promise<void> => {
  const period = await PeriodModel.findById(req.params.periodId);
  if (!period) throw new NotFoundError('Period');
  res.status(StatusCodes.OK).json(period);
};

export const create = async (
  req: TypedRequestBody<PeriodCreateUpdateInput>,
  res: TypedResponse<Period>
): Promise<void> => {
  const { name, endDate } = req.body;
  const period = await PeriodModel.create({ name, endDate });
  res.status(StatusCodes.OK).json(period);
};

export const update = async (
  req: TypedRequestBody<PeriodCreateUpdateInput>,
  res: TypedResponse<Period>
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

  res.status(StatusCodes.OK).json(period);
};

export const close = async (
  req: Request,
  res: TypedResponse<Period>
): Promise<void> => {
  const period = await PeriodModel.findById(req.params.periodId);
  if (!period) throw new NotFoundError('Period');

  period.status = 'CLOSED';
  await period.save();

  res.status(StatusCodes.OK).json(period);
};

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

const assignedPraiseCount = (quantifier: Quantifier): number => {
  return quantifier.receivers.reduce((sum, receiver) => {
    return sum + receiver.praiseCount;
  }, 0);
};

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

export const praise = async (
  req: Request,
  res: TypedResponse<Praise[]>
): Promise<void> => {
  const period = await PeriodModel.findById(req.params.periodId);
  if (!period) throw new NotFoundError('Period');

  const previousPeriodEndDate = await getPreviousPeriodEndDate(period);

  const praise = await PraiseModel.find()
    .where({
      createdAt: { $gte: previousPeriodEndDate, $lt: period.endDate },
    })
    .sort({ createdAt: -1 })
    .populate('receiver giver');

  res.status(StatusCodes.OK).json(praise);
};

export const verifyQuantifierPoolSize = async (
  req: Request,
  res: Response
): Promise<void> => {
  const quantifierPool = await UserModel.find({ roles: UserRole.QUANTIFIER });
  const assignedQuantifiers = await assignQuantifiersDryRun(
    req.params.periodId
  );

  const response = {
    quantifierPoolSize: quantifierPool.length,
    requiredPoolSize: assignedQuantifiers.length,
  };

  res.status(StatusCodes.OK).json(response);
};

export const assignQuantifiers = async (
  req: Request,
  res: Response
): Promise<void> => {
  const period = await PeriodModel.findById(req.params.periodId);
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
            quantifier: quantifier._id,
          });
          await praise.save();
        }
      }
    }
  }

  period.status = 'QUANTIFY';
  await period.save();

  res.status(StatusCodes.OK).json(praise(req, res));
};
