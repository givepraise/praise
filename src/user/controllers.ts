import { BadRequestError, NotFoundError } from '@shared/errors';
import { getQuerySort } from '@shared/functions';
import { QueryInput, SearchQueryInput } from '@shared/inputs';
import { TypedRequestBody, TypedRequestQuery } from '@shared/types';
import { Request, Response } from 'express';
import {
  userListTransformer,
  userSingleTransformer,
} from 'src/user/transformers';
import { UserModel } from './entities';
import { RoleChangeRequest } from './types';

/**
 * Description
 * @param
 */
export const all = async (
  req: TypedRequestQuery<QueryInput>,
  res: Response
): Promise<Response> => {
  const users = await UserModel.paginate({
    ...req.query,
    sort: getQuerySort(req.query),
    populate: 'accounts',
  });

  return res.status(200).json(userListTransformer(req, users));
};

/**
 * Description
 * @param
 */
export const single = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const user = await UserModel.findById(req.params.id);

  if (!user) throw new NotFoundError('User');

  return res.status(200).json(userSingleTransformer(req, user));
};

/**
 * Description
 * @param
 */
export const search = async (
  req: TypedRequestQuery<SearchQueryInput>,
  res: Response
): Promise<Response> => {
  const searchQuery = {
    ethereumAddress: { $regex: req.query.search },
  };

  const users = await UserModel.paginate({
    query: searchQuery,
    ...req.query,
    sort: getQuerySort(req.query),
  });

  return res.status(200).json(userListTransformer(req, users));
};

/**
 * Description
 * @param
 */
export const addRole = async (
  req: TypedRequestBody<RoleChangeRequest>,
  res: Response
): Promise<Response> => {
  const user = await UserModel.findById(req.params.id).populate('accounts');

  if (!user) throw new NotFoundError('User');

  const { role } = req.body;
  if (!role) throw new BadRequestError('Role is required');

  if (!user.roles.includes(role)) {
    user.roles.push(role);
  }
  await user.save();
  return res.status(200).json(userSingleTransformer(req, user));
};

/**
 * Description
 * @param
 */
export const removeRole = async (
  req: TypedRequestBody<RoleChangeRequest>,
  res: Response
): Promise<Response> => {
  const user = await UserModel.findById(req.params.id).populate('accounts');
  if (!user) throw new NotFoundError('User');

  const { role } = req.body;
  if (!role) throw new BadRequestError('Role is required');

  const roleIndex = user.roles.indexOf(role);
  user.roles.splice(roleIndex, 1);

  await user.save();
  return res.status(200).json(userSingleTransformer(req, user));
};
