import PeriodModel, { PeriodInterface } from '@entities/Period';
import PraiseModel from '@entities/Praise';
import UserModel, { UserRole } from '@entities/User';
import { BadRequestError, NotFoundError } from '@shared/errors';
import { getQuerySort } from '@shared/functions';
import { PeriodCreateUpdateInput, QueryInput } from '@shared/inputs';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

const QUANTIFIERS_PER_PRAISE_RECEIVER = 3;
const PRAISE_PER_QUANTIFIER = 50;
const TOLERANCE = 1.2;
const MAX_PRAISE_PER_QUANTIFIER = PRAISE_PER_QUANTIFIER * TOLERANCE;

export const all = async (
  req: Request<any, QueryInput, any>,
  res: Response
): Promise<Response> => {
  const response = await PeriodModel.paginate({
    ...req.query,
    sort: getQuerySort(req.query),
  });
  return res.status(StatusCodes.OK).json(response);
};

export const single = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const period = await PeriodModel.findById(req.params.periodId);
  if (!period) return res.status(StatusCodes.NOT_FOUND);
  return res.status(StatusCodes.OK).json(period);
};

export const create = async (
  req: Request<any, PeriodCreateUpdateInput, any>,
  res: Response
): Promise<Response> => {
  const { name, endDate } = req.body;
  const period = await PeriodModel.create({ name, endDate });
  return res.status(StatusCodes.OK).json(period);
};

export const update = async (
  req: Request<any, PeriodCreateUpdateInput, any>,
  res: Response
): Promise<Response> => {
  let period = await PeriodModel.findById(req.params.periodId);
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

export const close = async (req: Request, res: Response): Promise<Response> => {
  let period = await PeriodModel.findById(req.params.periodId);
  if (!period) return res.status(StatusCodes.NOT_FOUND);

  period.status = 'CLOSED';
  period.save();

  return res.status(StatusCodes.OK).json(period);
};

// Returns previous period end date or 1970-01-01 if no previous period
const getPreviousPeriodEndDate = async (period: PeriodInterface) => {
  const previousPeriod = await PeriodModel.findOne({
    endDate: { $lt: period.endDate },
  }).sort({ endDate: -1 });
  const previousEndDate = previousPeriod
    ? previousPeriod.endDate
    : new Date(+0);
  return previousEndDate;
};

interface Receiver {
  _id: string;
  praiseCount: number;
  praiseIds: string[];
}

// Returns an array of an
const getQuantifierReceivers = async (periodId: string) => {
  const period = await PeriodModel.findById(periodId);
  if (!period) throw new NotFoundError('Period');

  const previousPeriodEndDate = await getPreviousPeriodEndDate(period);

  // Aggregate all period praise receivers and count number of received praise
  const receivers = await PraiseModel.aggregate([
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

  let qi = 0;
  let quantifierReceivers = [];
  quantifierReceivers[qi] = new Array();
  let riStart = 0;

  const assignedPraiseCount = (quantifier: Receiver[]) => {
    return quantifier.reduce(function (sum, receiver) {
      return sum + receiver.praiseCount;
    }, 0);
  };

  let assignsLeft = receivers.length;
  while (assignsLeft > 0) {
    // Move start index each loop to avoid same combinations of receivers being
    // assigned to quantifiers.
    riStart = riStart < receivers.length - 1 ? riStart + 1 : 0;
    for (let ri = riStart; ri < receivers.length; ri++) {
      receivers[ri].assignedQuantifiers = receivers[ri].assignedQuantifiers
        ? receivers[ri].assignedQuantifiers
        : 0;

      if (receivers[ri].assignedQuantifiers < QUANTIFIERS_PER_PRAISE_RECEIVER) {
        if (
          assignedPraiseCount(quantifierReceivers[qi]) +
            receivers[ri].praiseCount >
            MAX_PRAISE_PER_QUANTIFIER &&
          assignedPraiseCount(quantifierReceivers[qi]) > 0
        ) {
          quantifierReceivers[++qi] = new Array(); // Initialise new quantifier
          continue;
        }

        quantifierReceivers[qi].push(receivers[ri]);

        receivers[ri].assignedQuantifiers = receivers[ri].assignedQuantifiers
          ? receivers[ri].assignedQuantifiers + 1
          : 1;

        assignsLeft =
          receivers[ri].assignedQuantifiers === QUANTIFIERS_PER_PRAISE_RECEIVER
            ? assignsLeft - 1
            : assignsLeft;
      }
    }
  }

  return quantifierReceivers as Array<Array<Receiver>>;
};

export const verifyQuantifierPoolSize = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const quantifierReceivers = await getQuantifierReceivers(req.params.periodId);

  const quantifierPool = await UserModel.find({ roles: UserRole.QUANTIFIER });

  const response = {
    quantifierPoolSize: quantifierPool.length,
    requiredPoolSize: quantifierReceivers.length,
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

  const quantifierReceivers = await getQuantifierReceivers(req.params.periodId);
  const quantifierPool = await UserModel.find({ roles: UserRole.QUANTIFIER });

  const requiredPoolSize = quantifierReceivers.length;

  if (requiredPoolSize > quantifierPool.length)
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ error: 'Quantifier pool size too small.' });

  let selectedQuantifiers = quantifierPool
    .sort(() => 0.5 - Math.random())
    .slice(0, requiredPoolSize);

  const getQuantifier = (receiver: Receiver, qi: number) => {
    // Quantifying your own praise is not allowed
    if (receiver._id === quantifierPool[qi]._id) {
      return qi === quantifierPool.length
        ? quantifierPool[qi - 1]._id
        : quantifierPool[qi + 1]._id;
    }
    return quantifierPool[qi];
  };

  // Quantifiers
  for (let qi = 0; qi < requiredPoolSize; qi++) {
    // Receivers
    for (let receiver of quantifierReceivers[qi]) {
      const quantifier = getQuantifier(receiver, qi);
      // Praise
      for (let praiseId of receiver.praiseIds) {
        const praise = await PraiseModel.findById(praiseId);
        if (praise) {
          praise.quantifications.push({
            quantifier: selectedQuantifiers[qi]._id,
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

export const praise = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const period = await PeriodModel.findById(req.params.periodId);
  if (!period) throw new NotFoundError('Period');

  const previousPeriodEndDate = await getPreviousPeriodEndDate(period);

  const praise = await PraiseModel.find()
    .where({
      createdAt: { $gte: previousPeriodEndDate, $lt: period.endDate },
    })
    .populate('receiver');

  return res.status(StatusCodes.OK).json(praise);
};
