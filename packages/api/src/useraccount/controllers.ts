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
const all = async (
  req: TypedRequestQuery<QueryInput>,
  res: TypedResponse<PaginatedResponseBody<UserAccount>>
): Promise<void> => {
  const accounts = await UserAccountModel.paginate({
    ...req.query, //TODO the object is passed unchecked to mongoose. Security risk?
    sort: getQuerySort(req.query),
  });
  res.status(200).json(accounts);
};

/**
 * Description
 * @param
 */
const single = async (
  req: Request,
  res: TypedResponse<UserAccount>
): Promise<void> => {
  const account = await UserAccountModel.findById(req.params.id);
  if (!account) throw new NotFoundError('UserAccount');
  res.status(200).json(account);
};

export { all, single };
