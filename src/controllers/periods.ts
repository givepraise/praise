import PeriodModel from '@entities/Period';
import PraiseModel from '@entities/Praise';
import UserModel, { UserRole } from '@entities/User';
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

const _verifyQuantifierPoolSize = async (periodId: string) => {
  const period = await PeriodModel.findById(periodId);
  if (!period) throw new Error('Period not found.');

  // Group all praise receivers for period and count number of received praise
  const pool = await UserModel.find({ roles: UserRole.QUANTIFIER });

  // Previous period end date or 1970-01-01 if no previous period
  const previousPeriod = await PeriodModel.findOne({
    endDate: { $lt: period.endDate },
  }).sort({ endDate: -1 });
  const previousEndDate = previousPeriod
    ? previousPeriod.endDate
    : new Date(+0);

  // Group all praise receivers for period and count number of received praise
  const receivers = await PraiseModel.aggregate([
    {
      $match: {
        createdAt: { $gt: previousEndDate, $lt: period.endDate },
      },
    },
    { $group: { _id: '$receiver', praiseCount: { $count: {} } } },
  ] as any);

  // Init counter to keep track of how many quantifiers are assigned to each receiver
  for (let receiver of receivers) {
    receiver.assignedQuantifiers = 0;
  }

  let quantifiers = [0];
  let qi = 0;
  let riStart = 0;

  // let qstats = [];
  // qstats[qi] = new Array();

  let assignsLeft = receivers.length;

  while (assignsLeft > 0) {
    // Move start index each loop to avoid same combinations of receivers being
    // assigned to quantifiers.
    riStart = riStart < receivers.length - 1 ? riStart + 1 : 0;
    for (let ri = riStart; ri < receivers.length; ri++) {
      if (receivers[ri].assignedQuantifiers < QUANTIFIERS_PER_PRAISE_RECEIVER) {
        if (
          quantifiers[qi] + receivers[ri].praiseCount >
          PRAISE_PER_QUANTIFIER
        ) {
          qi++;
          quantifiers[qi] = 0;
          //qstats[qi] = new Array();
        }

        if (
          receivers[ri].praiseCount > MAX_PRAISE_PER_QUANTIFIER &&
          quantifiers[qi] === 0
        ) {
          quantifiers[qi] = receivers[ri].praiseCount;
          //qstats[qi].push(receivers[ri].praiseCount);
          receivers[ri].assignedQuantifiers += 1;
        }

        if (
          quantifiers[qi] + receivers[ri].praiseCount <=
          PRAISE_PER_QUANTIFIER
        ) {
          quantifiers[qi] += receivers[ri].praiseCount;
          //qstats[qi].push(receivers[ri].praiseCount);
          receivers[ri].assignedQuantifiers += 1;
        }

        if (
          receivers[ri].assignedQuantifiers === QUANTIFIERS_PER_PRAISE_RECEIVER
        ) {
          assignsLeft--;
        }
      }
    }
    // console.log(receivers);
    // console.log(qstats);
  }

  const response = {
    quantifierPoolSize: pool.length,
    requiredPoolSize: quantifiers.length,
  };

  // console.log(response);
  return response;
};

// const _verifyQuantifierPoolSize = async (periodId: string) => {
//   const period = await PeriodModel.findById(periodId);
//   if (!period) throw new Error('Period not found.');

//   // Group all praise receivers for period and count number of received praise
//   const pool = await UserModel.find({ roles: UserRole.QUANTIFIER });

//   // Previous period end date or 1970-01-01 if no previous period
//   const previousPeriod = await PeriodModel.findOne({
//     endDate: { $lt: period.endDate },
//   }).sort({ endDate: -1 });
//   const previousEndDate = previousPeriod
//     ? previousPeriod.endDate
//     : new Date(+0);

//   // Group all praise receivers for period and count number of received praise
//   const receivers = await PraiseModel.aggregate([
//     {
//       $match: {
//         createdAt: { $gt: previousEndDate, $lt: period.endDate },
//       },
//     },
//     { $group: { _id: '$receiver', praiseCount: { $count: {} } } },
//   ] as any);

//   // Init counter to keep track of how many quantifiers are assigned to each receiver
//   for (let receiver of receivers) {
//     receiver.assignedQuantifiers = 0;
//   }

//   let quantifiers = [0];
//   let qi = 0;
//   let riStart = 0;

//   // let qstats = [];
//   // qstats[qi] = new Array();

//   let assignsLeft = receivers.length;

//   while (assignsLeft > 0) {
//     // Move start index each loop to avoid same combinations of receivers being
//     // assigned to quantifiers.
//     riStart = riStart < receivers.length - 1 ? riStart + 1 : 0;
//     for (let ri = riStart; ri < receivers.length; ri++) {
//       if (receivers[ri].assignedQuantifiers < QUANTIFIERS_PER_PRAISE_RECEIVER) {
//         if (
//           quantifiers[qi] + receivers[ri].praiseCount >
//           PRAISE_PER_QUANTIFIER
//         ) {
//           qi++;
//           quantifiers[qi] = 0;
//           //qstats[qi] = new Array();
//         }

//         if (
//           receivers[ri].praiseCount > MAX_PRAISE_PER_QUANTIFIER &&
//           quantifiers[qi] === 0
//         ) {
//           quantifiers[qi] = receivers[ri].praiseCount;
//           //qstats[qi].push(receivers[ri].praiseCount);
//           receivers[ri].assignedQuantifiers += 1;
//         }

//         if (
//           quantifiers[qi] + receivers[ri].praiseCount <=
//           PRAISE_PER_QUANTIFIER
//         ) {
//           quantifiers[qi] += receivers[ri].praiseCount;
//           //qstats[qi].push(receivers[ri].praiseCount);
//           receivers[ri].assignedQuantifiers += 1;
//         }

//         if (
//           receivers[ri].assignedQuantifiers === QUANTIFIERS_PER_PRAISE_RECEIVER
//         ) {
//           assignsLeft--;
//         }
//       }
//     }
//     // console.log(receivers);
//     // console.log(qstats);
//   }

//   const response = {
//     quantifierPoolSize: pool.length,
//     requiredPoolSize: quantifiers.length,
//   };

//   // console.log(response);
//   return response;
// };

export const verifyQuantifierPoolSize = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const response = await _verifyQuantifierPoolSize(req.params.periodId);
  return res.status(StatusCodes.OK).json(response);
};

export const assignQuantifiers = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const poolSize = await _verifyQuantifierPoolSize(req.params.periodId);

  if (poolSize.requiredPoolSize > poolSize.quantifierPoolSize)
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ error: 'Quantifier pool size too small.' });

  let period = await PeriodModel.findById(req.params.periodId);
  if (!period) throw new Error('Period not found.');

  // Group all praise receivers for period and count number of received praise
  const quantifierPool = await UserModel.find({ roles: UserRole.QUANTIFIER });

  let selectedQuantifiers = quantifierPool
    .sort(() => 0.5 - Math.random())
    .slice(0, poolSize.requiredPoolSize);

  // Previous period end date or 1970-01-01 if no previous period
  const previousPeriod = await PeriodModel.findOne({
    endDate: { $lt: period.endDate },
  }).sort({ endDate: -1 });
  const previousEndDate = previousPeriod
    ? previousPeriod.endDate
    : new Date(+0);

  // Group all praise receivers for period and count number of received praise
  const receivers = await PraiseModel.aggregate([
    {
      $match: {
        createdAt: { $gt: previousEndDate, $lt: period.endDate },
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

  // Init counter to keep track of how many quantifiers are assigned to each receiver
  for (let receiver of receivers) {
    receiver.assignedQuantifiers = 0;
  }

  let quantifiers = [0];
  let qi = 0;
  let riStart = 0;

  // let qstats = [];
  // qstats[qi] = new Array();

  let assignsLeft = receivers.length;

  while (assignsLeft > 0) {
    // Move start index each loop to avoid same combinations of receivers being
    // assigned to quantifiers.
    riStart = riStart < receivers.length - 1 ? riStart + 1 : 0;
    for (let ri = riStart; ri < receivers.length; ri++) {
      if (receivers[ri].assignedQuantifiers < QUANTIFIERS_PER_PRAISE_RECEIVER) {
        if (
          quantifiers[qi] + receivers[ri].praiseCount >
          PRAISE_PER_QUANTIFIER
        ) {
          qi++;
          quantifiers[qi] = 0;
          //qstats[qi] = new Array();
        }

        if (
          receivers[ri].praiseCount > MAX_PRAISE_PER_QUANTIFIER &&
          quantifiers[qi] === 0
        ) {
          quantifiers[qi] = receivers[ri].praiseCount;
          //qstats[qi].push(receivers[ri].praiseCount);
          receivers[ri].assignedQuantifiers += 1;
          for (let praiseId of receivers[ri].praiseIds) {
            const praise = await PraiseModel.findById(praiseId);
            if (praise) {
              praise.quantifications.push({
                quantifier: selectedQuantifiers[qi]._id,
              });
              praise.save();
            }
          }
        }

        if (
          quantifiers[qi] + receivers[ri].praiseCount <=
          PRAISE_PER_QUANTIFIER
        ) {
          quantifiers[qi] += receivers[ri].praiseCount;
          //qstats[qi].push(receivers[ri].praiseCount);
          receivers[ri].assignedQuantifiers += 1;
          for (let praiseId of receivers[ri].praiseIds) {
            const praise = await PraiseModel.findById(praiseId);
            if (praise) {
              praise.quantifications.push({
                quantifier: selectedQuantifiers[qi]._id,
              });
              praise.save();
            }
          }
        }

        if (
          receivers[ri].assignedQuantifiers === QUANTIFIERS_PER_PRAISE_RECEIVER
        ) {
          assignsLeft--;
        }
      }
    }
    // console.log(receivers);
    // console.log(qstats);
  }

  // console.log(response);

  return res.status(StatusCodes.OK);
};
