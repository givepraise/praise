import {
  BadRequestError,
  InternalServerError,
  NotFoundError,
} from '@shared/errors';
import { getQuerySort } from '@shared/functions';
import { QueryInput } from '@shared/inputs';
import {
  PaginatedResponseBody,
  TypedRequestBody,
  TypedRequestQuery,
  TypedResponse,
} from '@shared/types';
import { Request } from 'express';
import { userListTransformer, userTransformer } from 'src/user/transformers';
import { UserModel } from './entities';
import { RoleChangeRequest, User, UserRole, UserSearchQuery } from './types';

/**
 * Description
 * @param
 */
export const all = async (
  req: TypedRequestQuery<QueryInput>,
  res: TypedResponse<PaginatedResponseBody<User>>
): Promise<TypedResponse<PaginatedResponseBody<User>>> => {
  const users = await UserModel.paginate({
    ...req.query, //TODO Unchecked input
    sort: getQuerySort(req.query),
    populate: 'accounts',
  });
  if (!users) throw new InternalServerError('No users found');
  return res.status(200).json(userListTransformer(req, users));
};

/**
 * Description
 * @param
 */
export const single = async (
  req: Request,
  res: TypedResponse<User>
): Promise<TypedResponse<User>> => {
  const user = await UserModel.findById(req.params.id);
  if (!user) throw new NotFoundError('User');
  return res.status(200).json(userTransformer(req, user));
};

/**
 * Description
 * @param
 */
export const search = async (
  req: TypedRequestQuery<UserSearchQuery>,
  res: TypedResponse<PaginatedResponseBody<User>>
): Promise<TypedResponse<PaginatedResponseBody<User>>> => {
  //TODO Support searching more than eth address
  const searchQuery = {
    ethereumAddress: { $regex: req.query.search },
  };

  const users = await UserModel.paginate({
    query: searchQuery,
    ...req.query, //TODO Unchecked input
    sort: getQuerySort(req.query),
  });
  if (!users) throw new NotFoundError('User');

  return res.status(200).json(userListTransformer(req, users));
};

/**
 * Description
 * @param
 */
export const addRole = async (
  req: TypedRequestBody<RoleChangeRequest>,
  res: TypedResponse<User>
): Promise<TypedResponse<User>> => {
  const user = await UserModel.findById(req.params.id).populate('accounts');
  if (!user) throw new NotFoundError('User');

  const { role } = req.body;
  if (!role) throw new BadRequestError('Role is required');
  if (!(role in UserRole)) throw new BadRequestError('Invalid role');

  if (!user.roles.includes(role)) {
    user.roles.push(role);
    await user.save();
  }
  return res.status(200).json(userTransformer(req, user));
};

/**
 * Description
 * @param
 */
export const removeRole = async (
  req: TypedRequestBody<RoleChangeRequest>,
  res: TypedResponse<User>
): Promise<TypedResponse<User>> => {
  const user = await UserModel.findById(req.params.id).populate('accounts');
  if (!user) throw new NotFoundError('User');

  const { role } = req.body;
  if (!role) throw new BadRequestError('Role is required');

  const roleIndex = user.roles.indexOf(role);

  if (roleIndex > -1) {
    user.roles.splice(roleIndex, 1);
    await user.save();
  }
  return res.status(200).json(userTransformer(req, user));
};
