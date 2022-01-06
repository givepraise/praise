import UserAccountModel from '@entities/UserAccount';
import { NotFoundError } from '@shared/errors';
import { getQuerySort } from '@shared/functions';
import { QueryInput } from '@shared/inputs';
import { Request, Response } from 'express';

export const all = async (
  req: Request<any, QueryInput, any>,
  res: Response
): Promise<Response> => {
  const accounts = await UserAccountModel.paginate({
    ...req.query,
    sort: getQuerySort(req.query),
  });

  return res.status(200).json(accounts);
};

const single = async (req: Request, res: Response): Promise<Response> => {
  const account = await UserAccountModel.findById(req.params.id);
  if (!account) throw new NotFoundError('UserAccount');

  return res.status(200).json(account);
};

export default { all, single };
