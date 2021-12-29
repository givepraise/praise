import { Request, Response } from 'express';
import UserModel from '@entities/User';
import {
  AddRoleInput,
  QueryInput,
  RemoveRoleInput,
  SearchQueryInput,
} from '@shared/inputs';
import { getQuerySort } from '@shared/functions';
import {
  userListTransformer,
  userSingleTransformer,
} from 'src/transformers/userTransformer';
import { NOT_FOUND, BAD_REQUEST } from '@shared/constants';

const all = async (
  req: Request<any, QueryInput, any>,
  res: Response
): Promise<Response> => {
  const users = await UserModel.paginate({
    ...req.query,
    sort: getQuerySort(req.query),
  });

  return res.status(200).json(userListTransformer(req, users));
};

const single = async (req: Request, res: Response): Promise<Response> => {
  const user = await UserModel.findById(req.params.id);

  if (!user)
    return res.status(NOT_FOUND).json({
      error: 'User not found.',
    });

  return res.status(200).json(userSingleTransformer(req, user));
};

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

const addRole = async (
  req: Request<any, any, AddRoleInput>,
  res: Response
): Promise<Response> => {
  const user = await UserModel.findById(req.params.id);
  const { role } = req.body;

  if (!user)
    return res.status(NOT_FOUND).json({
      error: 'User not found.',
    });

  try {
    if (!user.roles.includes(role)) {
      user.roles.push(role);
    }
    await user.save();
    return res.status(200).json(userSingleTransformer(req, user));
  } catch (e: any) {
    return res.status(BAD_REQUEST).json({ errors: e.errors });
  }
};

const removeRole = async (
  req: Request<any, any, RemoveRoleInput>,
  res: Response
): Promise<Response> => {
  const user = await UserModel.findById(req.params.id);
  const { role } = req.body;

  if (!user)
    return res.status(NOT_FOUND).json({
      error: 'User not found.',
    });

  try {
    var roleIndex = user.roles.indexOf(role);
    user.roles.splice(roleIndex, 1);

    await user.save();
    return res.status(200).json(userSingleTransformer(req, user));
  } catch (e: any) {
    return res.status(BAD_REQUEST).json({ errors: e.errors });
  }
};

export default { all, single, search, addRole, removeRole };
