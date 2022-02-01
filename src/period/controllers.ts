import { PraiseModel } from '@praise/entities';
import { Praise } from '@praise/types';
import {
  BadRequestError,
  InternalServerError,
  NotFoundError,
} from '@shared/errors';
import { getQuerySort } from '@shared/functions';
import { QueryInput } from '@shared/inputs';
import { settingFloat, settingInt } from '@shared/settings';
import {
  PaginatedResponseBody,
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
): Promise<TypedResponse<PaginatedResponseBody<Period>>> => {
  const response = await PeriodModel.paginate({
    ...req.query,
    sort: getQuerySort(req.query),
  });
  return res.status(StatusCodes.OK).json(response);
};

export const single = async (
  req: Request,
  res: TypedResponse<Period>
): Promise<TypedResponse<Period>> => {
  const period = await PeriodModel.findById(req.params.periodId);
  if (!period) return res.status(StatusCodes.NOT_FOUND);
  return res.status(StatusCodes.OK).json(period);
};

export const create = async (
  req: Request<any, PeriodCreateUpdateInput, any>,
  res: TypedResponse<Period>
): Promise<TypedResponse<Period>> => {
  const { name, endDate } = req.body;
  const period = await PeriodModel.create({ name, endDate });
  return res.status(StatusCodes.OK).json(period);
};

export const update = async (
  req: Request<any, PeriodCreateUpdateInput, any>,
  res: TypedResponse<Period>
): Promise<TypedResponse<Period>> => {
  const period = await PeriodModel.findById(req.params.periodId);
  if (!period) return res.status(StatusCodes.NOT_FOUND);

  if (req.body.name !== period.name) {
    period.name = req.body.name;
  }
  if (req.body.endDate !== period.endDate) {
    const d = new Date(req.body.endDate);
    if (d.toString() === 'Invalid Date')
      return res.status(StatusCodes.BAD_REQUEST).send('Invalid date format.');
    period.endDate = d;
  }

  await period.save();

  return res.status(StatusCodes.OK).json(period);
};

export const close = async (
  req: Request,
  res: TypedResponse<Period>
): Promise<TypedResponse<Period>> => {
  const period = await PeriodModel.findById(req.params.periodId);
  if (!period) return res.status(StatusCodes.NOT_FOUND);

  period.status = 'CLOSED';
  period.save();

  return res.status(StatusCodes.OK).json(period);
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
  ] as any);

  const quantifierPool = await UserModel.find({ roles: UserRole.QUANTIFIER });
  const poolIds: Quantifier[] = quantifierPool.map(
    (user) => ({ _id: user._id, receivers: [] } as Quantifier)
  );
  // Scramble the quant pool to randomize who gets assigned
  const pool = poolIds.sort(() => 0.5 - Math.random()).slice(0, poolIds.length);

  const quantifiersPerPraiseReceiver = await settingInt(
    'PRAISE_QUANTIFIERS_PER_PRAISE_RECEIVER'
  );
  const tolerance = await settingFloat(
    'PRAISE_QUANTIFIERS_PER_PRAISE_RECEIVER_TOLERANCE'
  );
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

      // Receiver already assigned to quantifier
      if (q.receivers.findIndex((receiver) => receiver._id === r._id) > -1) {
        continue;
      }

      // Receiver already assigned to enough quantifiers
      if (r.assignedQuantifiers === quantifiersPerPraiseReceiver) {
        receivers.splice(ri, 1);
        continue;
      }

      // Assign praise that meet criteria
      if (
        (q.receivers.length === 0 && r.praiseCount >= maxPraisePerQuantifier) ||
        assignedPraiseCount(q) + r.praiseCount < maxPraisePerQuantifier
      ) {
        q.receivers.push(r);
        r.assignedQuantifiers = r.assignedQuantifiers
          ? r.assignedQuantifiers + 1
          : 1;
        continue;
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
): Promise<TypedResponse<Praise[]>> => {
  const period = await PeriodModel.findById(req.params.periodId);
  if (!period) throw new NotFoundError('Period');

  const previousPeriodEndDate = await getPreviousPeriodEndDate(period);

  const praise = await PraiseModel.find()
    .where({
      createdAt: { $gte: previousPeriodEndDate, $lt: period.endDate },
    })
    .sort({ createdAt: -1 })
    .populate('receiver giver');

  return res.status(StatusCodes.OK).json(praise);
};

export const verifyQuantifierPoolSize = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const quantifierPool = await UserModel.find({ roles: UserRole.QUANTIFIER });
  const assignedQuantifiers = await assignQuantifiersDryRun(
    req.params.periodId
  );

  const response = {
    quantifierPoolSize: quantifierPool.length,
    requiredPoolSize: assignedQuantifiers.length,
  };

  return res.status(StatusCodes.OK).json(response);
};

export const assignQuantifiers = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const period = await PeriodModel.findById(req.params.periodId);
  if (!period) throw new NotFoundError('Period');
  if (period.status !== 'OPEN')
    throw new BadRequestError(
      'Quantifiers can only be assigned on OPEN periods.'
    );

  const assignedQuantifiers = await assignQuantifiersDryRun(
    req.params.periodId
  );

  if (assignedQuantifiers.find((q) => typeof q._id === 'undefined'))
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ error: 'Quantifier pool size too small.' });

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
          praise.save();
        }
      }
    }
  }

  period.status = 'QUANTIFY';
  period.save();

  return praise(req, res);
};
