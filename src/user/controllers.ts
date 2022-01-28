import UserModel from '@entities/User';
import { BadRequestError, NotFoundError } from '@shared/errors';
import { getQuerySort } from '@shared/functions';
import {
  AddRoleInput,
  QueryInput,
  RemoveRoleInput,
  SearchQueryInput,
} from '@shared/inputs';
import { Request, Response } from 'express';
import {
  userListTransformer,
  userSingleTransformer,
} from 'src/transformers/userTransformer';

/**
 * Description
 * @param
 */
const all = async (
  req: Request<any, any, QueryInput>,
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
const single = async (req: Request, res: Response): Promise<Response> => {
  const user = await UserModel.findById(req.params.id);

  if (!user) throw new NotFoundError('User');

  return res.status(200).json(userSingleTransformer(req, user));
};

/**
 * Description
 * @param
 */
const search = async (
  req: Request<any, SearchQueryInput, any>,
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
const addRole = async (
  req: Request<any, AddRoleInput, any>,
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
const removeRole = async (
  req: Request<any, RemoveRoleInput, any>,
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

export default { all, single, search, addRole, removeRole };
