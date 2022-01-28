import { UserInterface } from '@entities/User';
import { RouteType } from '@shared/constants';
import { Request } from 'express';
import { PaginationModel } from 'mongoose-paginate-ts';

const userData = (req: Request, user: UserInterface) => {
  return {
    _id: user._id,
    ethereumAddress:
      req.body.routeType !== RouteType.user ? user.ethereumAddress : undefined,
    accounts: user.accounts,
    roles: user.roles,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

export const userListTransformer = (
  req: Request,
  data: PaginationModel<UserInterface> | undefined //TODO remove undefined
) => {
  if (!data) return [];

  const response = {
    ...data,
    docs: data.docs.map((d) => {
      return userData(req, d);
    }),
  };

  return response;
};

export const userSingleTransformer = (req: Request, data: UserInterface) => {
  return userData(req, data);
};
