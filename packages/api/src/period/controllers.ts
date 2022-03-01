import {
  BadRequestError,
  InternalServerError,
  NotFoundError,
} from '@error/errors';
import { PraiseModel } from '@praise/entities';
import { praiseDocumentListTransformer } from '@praise/transformers';
import { PraiseDetailsDto, PraiseDto, Receiver, Quantifier } from '@praise/types';
import { praiseWithScore } from '@praise/utils';
import {
  getPraiseAllInput,
  getQueryInput,
  getQuerySort,
} from '@shared/functions';
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
import { Request } from 'express';
import { StatusCodes } from 'http-status-codes';
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
    // Receivers
    for (const receiver of q.receivers) {
      const praises = await PraiseModel.updateMany({ _id: { $in: receiver.praiseIds } }, {
        $push: {
          quantifications: {
            quantifier: q._id,
            score: 0,
            dismissed: false
          }
        }
      });
    }
  }

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
