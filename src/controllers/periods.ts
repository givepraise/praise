import { Request, Response } from 'express';
import PeriodModel from '@entities/Period';
import { QueryInput } from '@shared/inputs';
import { getQuerySort } from '@shared/functions';

// get periods
const getPeriods = async (
  req: Request<any, QueryInput, any>,
  res: Response
): Promise<Response> => {
  const response = await PeriodModel.paginate({
    ...req.query,
    sort: getQuerySort(req.query),
  });
  return res.status(200).json(response);
};

export default { getPeriods };
