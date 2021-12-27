import PeriodModel from '@entities/Period';
import { getQuerySort } from '@shared/functions';
import { QueryInput } from '@shared/inputs';
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
  req: Request<any, QueryInput, any>,
  res: Response
): Promise<Response> => {
  let period = await PeriodModel.findById(req.params.periodId);
  if (!period) return res.status(StatusCodes.INTERNAL_SERVER_ERROR);
  return res.status(StatusCodes.OK).json(period);
};

export const update = async (
  req: Request<any, QueryInput, any>,
  res: Response
): Promise<Response> => {
  const name = req.query.name as string;
  const endDate = req.query.endDate as string;

  if (!name && !endDate) return res.status(StatusCodes.BAD_REQUEST);

  let period = await PeriodModel.findById(req.params.periodId);
  if (!period) return res.status(StatusCodes.INTERNAL_SERVER_ERROR);

  if (name) period.name = name;
  if (endDate) {
    const d = new Date(endDate);
    if (d.toString() === 'Invalid Date')
      return res.status(StatusCodes.BAD_REQUEST).send('Invalid date format.');
    period.endDate = d;
  }

  period.save();

  return res.status(StatusCodes.OK).json(period);
};

export const close = async (
  req: Request<any, QueryInput, any>,
  res: Response
): Promise<Response> => {
  let period = await PeriodModel.findById(req.params.periodId);
  if (!period) return res.status(StatusCodes.INTERNAL_SERVER_ERROR);

  period.status = 'CLOSED';
  period.save();

  return res.status(StatusCodes.OK).json(period);
};
