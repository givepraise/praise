import { Request, Response } from 'express';
import UserModel from '@entities/User';
import { QueryInput } from '@shared/inputs';
import { getQuerySort } from '@shared/functions';

const getUsers = async (
  req: Request<any, QueryInput, any>,
  res: Response
): Promise<Response> => {
  const users = await UserModel.paginate({
    ...req.query,
    sort: getQuerySort(req.query),
  });
  return res.status(200).json(users);
};

const getAdminUsers = async (
  req: Request<any, QueryInput, any>,
  res: Response
): Promise<Response> => {
  const users = await UserModel.paginate({
    ...req.query,
    sort: getQuerySort(req.query),
  });
  return res.status(200).json(users);
};

const getUser = async (req: Request, res: Response): Promise<Response> => {
  const user = await UserModel.findById(req.params.id);
  return res.status(200).json(user);
};

const getAdminUser = async (req: Request, res: Response): Promise<Response> => {
  const user = await UserModel.findById(req.params.id);
  return res.status(200).json(user);
};

export default { getUsers, getUser, getAdminUsers, getAdminUser };
