import { NotFoundError } from '@shared/errors';
import { getQuerySort } from '@shared/functions';
import { QueryInput } from '@shared/inputs';
import {
  PaginatedResponseBody,
  TypedRequestQuery,
  TypedResponse,
} from '@shared/types';
import { Request } from 'express';
import { UserAccountModel } from './entities';
import { UserAccount } from './types';

/**
 * Description
 * @param
 */
export const all = async (
  req: TypedRequestQuery<QueryInput>,
  res: TypedResponse<PaginatedResponseBody<UserAccount>>
): Promise<TypedResponse<PaginatedResponseBody<UserAccount>>> => {
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
  res: TypedResponse<UserAccount>
): Promise<TypedResponse<UserAccount>> => {
  const account = await UserAccountModel.findById(req.params.id);
  if (!account) throw new NotFoundError('UserAccount');
  return res.status(200).json(account);
};
