import PeriodModel, { PeriodInterface } from '@entities/Period';
import { getQuerySort } from '@shared/functions';
import { PeriodCreateParams, QueryInput } from '@shared/inputs';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

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
  req: Request<any, PeriodCreateParams, any>,
  res: Response
): Promise<Response> => {
  const { name, endDate } = req.body;
  const period = await PeriodModel.create({ name, endDate });
  return res.status(StatusCodes.OK).json(period);
};

export const update = async (
  req: Request<any, PeriodInterface, any>,
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

export const verifyQuantifierPoolSize = async (
  req: Request,
  res: Response
): Promise<Response> => {
  // WORK IN PROGRESS!
  let period = await PeriodModel.findById(req.params.periodId);
  if (!period) return res.status(StatusCodes.NOT_FOUND);

  return res.status(StatusCodes.OK).json(period);
};
