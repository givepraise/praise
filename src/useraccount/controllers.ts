import { NotFoundError } from '@shared/errors';
import { getQuerySort } from '@shared/functions';
import { QueryInput } from '@shared/inputs';
import { TypedRequestQuery } from '@shared/types';
import { Request, Response } from 'express';
import { UserAccountModel } from './entities';

/**
 * Description
 * @param
 */
export const all = async (
  req: TypedRequestQuery<QueryInput>,
  res: Response
): Promise<Response> => {
  const accounts = await UserAccountModel.paginate({
    ...req.query, //TODO the object is passed unchecked to mongoose. Security risk?
    sort: getQuerySort(req.query),
  });

  return res.status(200).json(accounts);
};

/**
 * Description
 * @param
 */
export const single = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const account = await UserAccountModel.findById(req.params.id);
  if (!account) throw new NotFoundError('UserAccount');

  return res.status(200).json(account);
};
