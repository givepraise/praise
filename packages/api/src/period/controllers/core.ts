import { Types } from 'mongoose';
import { StatusCodes } from 'http-status-codes';
import e, { Request } from 'express';
import { add, compareAsc, parseISO } from 'date-fns';
import { isString } from 'lodash';
import { BadRequestError, NotFoundError } from '@/error/errors';
import { PraiseDetailsDto, PraiseDto } from '@/praise/types';
import {
  praiseListTransformer,
  praiseTransformer,
} from '@/praise/transformers';
import { insertNewPeriodSettings } from '@/periodsettings/utils';
import {
  TypedRequestBody,
  TypedResponse,
  PaginatedResponseBody,
  QueryInputParsedQs,
  TypedRequestQuery,
} from '@/shared/types';
import { getQueryInput, getQuerySort } from '@/shared/functions';
import { PraiseModel } from '@/praise/entities';
import { EventLogTypeKey } from '@/eventlog/types';
import { logEvent } from '@/eventlog/utils';
import {
  PeriodDetailsDto,
  PeriodUpdateInput,
  PeriodQuantifierPraiseInput,
  PeriodStatusType,
  PeriodReceiverPraiseInput,
  PeriodGiverPraiseInput,
} from '../types';
import {
  findPeriodDetailsDto,
  getPeriodDateRangeQuery,
  getPreviousPeriodEndDate,
  isPeriodLatest,
} from '../utils/core';
import { PeriodModel } from '../entities';
import { periodTransformer } from '../transformers';

/**
 * Fetch a paginated list of Periods
 *
 * @param {TypedRequestQuery<QueryInputParsedQs>} req
 * @param {(TypedResponse<PaginatedResponseBody<PeriodDetailsDto | undefined>>)} res
 * @returns {Promise<void>}
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
    const periodDetailsDto: PeriodDetailsDto[] = [];
    for (const period of periodList) {
      if (period?.status === PeriodStatusType.QUANTIFY) {
        const periodDetails = await findPeriodDetailsDto(period._id);
        periodDetailsDto.push(periodDetails);
        continue;
      }
      periodDetailsDto.push(periodTransformer(period));
    }
    res.status(StatusCodes.OK).json({
      ...response,
      docs: periodDetailsDto,
    });
  } else {
    res.status(StatusCodes.OK).json({
      ...response,
      docs: [],
    });
  }
};

/**
 * Fetch a single Period
 *
 * @param {Request} req
 * @param {TypedResponse<PeriodDetailsDto>} res
 * @returns {Promise<void>}
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
 * Create a Period
 *
 * @param {TypedRequestBody<PeriodUpdateInput>} req
 * @param {TypedResponse<PeriodDetailsDto>} res
 * @returns {Promise<void>}
 */
export const create = async (
  req: TypedRequestBody<PeriodUpdateInput>,
  res: TypedResponse<PeriodDetailsDto>
): Promise<void> => {
  const { name, endDate: endDateInput } = req.body;

  if (!name || !endDateInput)
    throw new BadRequestError('Period name and endDate are required');

  const endDate = parseISO(endDateInput);

  const latestPeriod = await PeriodModel.getLatest();
  if (latestPeriod) {
    const earliestDate = add(latestPeriod.endDate, { days: 7 });
    if (compareAsc(earliestDate, endDate) === 1) {
      throw new BadRequestError(
        'End date must be at least 7 days after the latest end date'
      );
    }
  }

  const period = await PeriodModel.create({ name, endDate });
  await insertNewPeriodSettings(period);

  await logEvent(
    EventLogTypeKey.PERIOD,
    `Created a new period "${period.name}"`,
    {
      userId: res.locals.currentUser._id,
    }
  );

  const periodDetailsDto = await findPeriodDetailsDto(period._id);

  res.status(StatusCodes.OK).json(periodDetailsDto);
};

/**
 * Description
 * @param
 */
/**
 * Update a Period's endDate or name
 *
 * @param {TypedRequestBody<PeriodUpdateInput>} req
 * @param {TypedResponse<PeriodDetailsDto>} res
 * @returns {Promise<void>}
 */
export const update = async (
  req: TypedRequestBody<PeriodUpdateInput>,
  res: TypedResponse<PeriodDetailsDto>
): Promise<void> => {
  const period = await PeriodModel.findById(req.params.periodId);
  if (!period) throw new NotFoundError('Period');

  const { name, endDate } = req.body;

  if (!name && !endDate)
    throw new BadRequestError('Updated name or endDate to must be specified');

  const eventLogMessages = [];

  if (name) {
    eventLogMessages.push(
      `Updated the name of period "${period.name}" to "${name}"`
    );

    period.name = name;
  }

  if (isString(endDate)) {
    const latest = await isPeriodLatest(period);
    if (!latest)
      throw new BadRequestError('Date change only allowed on latest period.');

    if (period.status !== PeriodStatusType.OPEN)
      throw new BadRequestError('Date change only allowed on open periods.');

    try {
      const newEndDate = parseISO(endDate);

      eventLogMessages.push(
        `Updated the end date of period "${period.name}" to ${endDate} UTC`
      );

      period.endDate = newEndDate;
    } catch (e) {
      throw new BadRequestError('Invalid date format.');
    }
  }

  await period.save();

  await logEvent(EventLogTypeKey.PERIOD, eventLogMessages.join(', '), {
    userId: res.locals.currentUser._id,
  });

  const periodDetailsDto = await findPeriodDetailsDto(period._id);
  res.status(StatusCodes.OK).json(periodDetailsDto);
};

/**
 * Close a Period (change status from 'QUANTIFY' to 'CLOSED')
 *
 * @param {Request} req
 * @param {TypedResponse<PeriodDetailsDto>} res
 * @returns {Promise<void>}
 */
export const close = async (
  req: Request,
  res: TypedResponse<PeriodDetailsDto>
): Promise<void> => {
  const period = await PeriodModel.findById(req.params.periodId);
  if (!period) throw new NotFoundError('Period');

  if (period.status === PeriodStatusType.CLOSED)
    throw new BadRequestError('Period is already closed');

  period.status = PeriodStatusType.CLOSED;
  await period.save();

  await logEvent(EventLogTypeKey.PERIOD, `Closed the period "${period.name}"`, {
    userId: res.locals.currentUser._id,
  });

  const periodDetailsDto = await findPeriodDetailsDto(period._id);

  res.status(StatusCodes.OK).json(periodDetailsDto);
};

/**
 * Fetch all Praise in a period
 *
 * @param {Request} req
 * @param {TypedResponse<PraiseDto[]>} res
 * @returns {Promise<void>}
 */
export const praise = async (
  req: Request,
  res: TypedResponse<PraiseDto[]>
): Promise<void> => {
  const period = await PeriodModel.findById(req.params.periodId);
  if (!period) throw new NotFoundError('Period');

  const previousPeriodEndDate = await getPreviousPeriodEndDate(period);

  const praiseList = await PraiseModel.find()
    .where({
      createdAt: { $gt: previousPeriodEndDate, $lte: period.endDate },
    })
    .sort({ createdAt: -1 })
    .populate('receiver giver forwarder');

  const praiseDetailsDtoList: PraiseDetailsDto[] = [];
  if (praiseList) {
    for (const praise of praiseList) {
      praiseDetailsDtoList.push(await praiseTransformer(praise));
    }
  }

  res.status(StatusCodes.OK).json(praiseDetailsDtoList);
};

/**
 * Returns praise list items for giver or receiver
 *
 * @param {string} id
 * @param {string} key
 * @param {string} periodId
 * @returns {Promise<PraiseDetailsDto>}
 */
const getGiverReceiverPraiseItems = async (
  id: string,
  key: string,
  periodId: string
): Promise<PraiseDetailsDto[]> => {
  const period = await PeriodModel.findById(periodId);
  if (!period) throw new NotFoundError('Period');

  const previousPeriodEndDate = await getPreviousPeriodEndDate(period);

  const praiseList = await PraiseModel.find()
    .where({
      createdAt: { $gt: previousPeriodEndDate, $lte: period.endDate },
      [key]: new Types.ObjectId(id),
    })
    .sort({ createdAt: -1 })
    .populate('receiver giver forwarder');

  const praiseDetailsDtoList: PraiseDetailsDto[] = [];
  if (praiseList) {
    for (const praise of praiseList) {
      praiseDetailsDtoList.push(await praiseTransformer(praise));
    }
  }

  return praiseDetailsDtoList;
};

/**
 * Fetch all Praise in a period with a given receiver
 *
 * @param {TypedRequestQuery<PeriodReceiverPraiseInput>} req
 * @param {TypedResponse<PraiseDto[]>} res
 * @returns {Promise<void>}
 */
export const receiverPraise = async (
  req: TypedRequestQuery<PeriodReceiverPraiseInput>,
  res: TypedResponse<PraiseDto[]>
): Promise<void> => {
  const id = req.query.id as string;
  if (!id) throw new BadRequestError('Id is a required field');

  const praiseDetailsDtoList = await getGiverReceiverPraiseItems(
    id,
    'receiver',
    req.params.periodId
  );

  res.status(StatusCodes.OK).json(praiseDetailsDtoList);
};

/**
 * Fetch all Praise in a period with a given giver
 *
 * @param {TypedRequestQuery<PeriodGiverPraiseInput>} req
 * @param {TypedResponse<PraiseDto[]>} res
 * @returns {Promise<void>}
 */
export const giverPraise = async (
  req: TypedRequestQuery<PeriodGiverPraiseInput>,
  res: TypedResponse<PraiseDto[]>
): Promise<void> => {
  const id = req.query.id as string;
  if (!id) throw new BadRequestError('Id is a required field');

  const praiseDetailsDtoList = await getGiverReceiverPraiseItems(
    id,
    'giver',
    req.params.periodId
  );

  res.status(StatusCodes.OK).json(praiseDetailsDtoList);
};

/**
 * Fetch all praise in a period assigned to a given quantifier
 *
 * @param {TypedRequestQuery<PeriodQuantifierPraiseInput>} req
 * @param {TypedResponse<PraiseDto[]>} res
 * @returns {Promise<void>}
 */
export const quantifierPraise = async (
  req: TypedRequestQuery<PeriodQuantifierPraiseInput>,
  res: TypedResponse<PraiseDto[]>
): Promise<void> => {
  const period = await PeriodModel.findById(req.params.periodId);
  if (!period) throw new NotFoundError('Period');

  const { quantifierId } = req.query;
  if (!quantifierId)
    throw new BadRequestError('Quantifier Id is a required field');

  const periodDateRangeQuery = await getPeriodDateRangeQuery(period);

  const praiseList = await PraiseModel.find({
    createdAt: periodDateRangeQuery,
    'quantifications.quantifier': new Types.ObjectId(quantifierId),
  });

  await PraiseModel.populate(praiseList, { path: 'receiver giver forwarder' });

  const response = await praiseListTransformer(praiseList);
  res.status(StatusCodes.OK).json(response);
};
