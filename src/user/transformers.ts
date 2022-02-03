import { RouteType } from '@shared/constants';
import { PaginatedResponseBody } from '@shared/types';
import { Request } from 'express';
import { PaginationModel } from 'mongoose-paginate-ts';
import { User, UserDocument } from './types';

const userDocToUser = (req: Request, userDoc: UserDocument): User => {
  const { _id, accounts, roles, createdAt, updatedAt, ethereumAddress } =
    userDoc;
  const user: User = {
    _id,
    accounts,
    roles,
    createdAt,
    updatedAt,
  };
  if (req.body.routeType !== RouteType.user) {
    user.ethereumAddress = ethereumAddress;
  }
  return user;
};

export const userListTransformer = (
  req: Request,
  userDocs: PaginationModel<UserDocument>
): PaginatedResponseBody<User> => {
  const response = {
    ...userDocs,
    docs: userDocs.docs.map((d) => {
      return userDocToUser(req, d);
    }),
  };
  return response;
};

export const userTransformer = (req: Request, data: UserDocument): User => {
  return userDocToUser(req, data);
};
