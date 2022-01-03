import PraiseModel from '@entities/Praise';
import { NOT_FOUND } from '@shared/constants';
import { getQuerySort } from '@shared/functions';
import { QueryInput } from '@shared/inputs';
import { Request, Response } from 'express';

export const all = async (
  req: Request<any, QueryInput, any>,
  res: Response
): Promise<Response> => {
  const praises = await PraiseModel.paginate({
    ...req.query,
    sort: getQuerySort(req.query),
    populate: 'giver receiver',
  });

  return res.status(200).json(praises);
};

const single = async (req: Request, res: Response): Promise<Response> => {
  const praise = await PraiseModel.findById(req.params.id);

  if (!praise)
    return res.status(NOT_FOUND).json({
      error: 'Praise not found.',
    });

  return res.status(200).json(praise);
};

export default { all, single };
