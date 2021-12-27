import { Request, Response } from 'express';
import UserModel from '@entities/User';
import { QueryInput } from '@shared/inputs';
import { getQuerySort } from '@shared/functions';
import {
  userListTransformer,
  userSingleTransformer,
} from 'src/transformers/userTransformer';
import { NOT_FOUND } from '@shared/constants';

const getUsers = async (
  req: Request<any, QueryInput, any>,
  res: Response
): Promise<Response> => {
  const users = await UserModel.paginate({
    ...req.query,
    sort: getQuerySort(req.query),
  });

  return res.status(200).json(userListTransformer(req, users));
};

const getUser = async (req: Request, res: Response): Promise<Response> => {
  const user = await UserModel.findById(req.params.id);

  if (!user)
    return res.status(NOT_FOUND).json({
      error: 'User not found.',
    });

  return res.status(200).json(userSingleTransformer(req, user));
};

export default { getUsers, getUser };
