import { NotFoundError } from '@error/errors';
import { getQueryInput, getQuerySort } from '@shared/functions';
import {
  PaginatedResponseBody,
  QueryInputParsedQs,
  TypedRequestQuery,
  TypedResponse,
} from '@shared/types';
import { Request } from 'express';
import { UserAccountModel } from './entities';
import {
  userAccountListTransformer,
  userAccountTransformer,
} from './transformers';
import { UserAccountDto } from './types';

/**
 * Description
 * @param
 */
const all = async (
  req: TypedRequestQuery<QueryInputParsedQs>,
  res: TypedResponse<PaginatedResponseBody<UserAccountDto>>
): Promise<void> => {
  const query = getQueryInput(req.query);

  const accounts = await UserAccountModel.paginate({
    ...query, //TODO the object is passed unchecked to mongoose. Security risk?
    sort: getQuerySort(req.query),
  });
  const response = {
    ...accounts,
    docs: userAccountListTransformer(accounts?.docs),
  };
  res.status(200).json(response);
};

/**
 * Description
 * @param
 */
const single = async (
  req: Request,
  res: TypedResponse<UserAccountDto>
): Promise<void> => {
  const account = await UserAccountModel.findById(req.params.id);
  if (!account) throw new NotFoundError('UserAccount');
  res.status(200).json(userAccountTransformer(account));
};

export { all, single };
