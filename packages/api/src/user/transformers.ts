import { PaginatedResponseBody } from '@shared/types';
import { Response } from 'express';
import { PaginationModel } from 'mongoose-paginate-ts';
import { User, UserDocument, UserRole } from './types';

const userDocToUser = (res: Response, userDoc: UserDocument): User => {
  const { _id, accounts, roles, createdAt, updatedAt, ethereumAddress } =
    userDoc;

  const user: User = {
    _id,
    accounts,
    roles,
    createdAt,
    updatedAt,
  };

  /* Only return eth address to admin or quantifier */
  if (
    res.locals?.authRole === UserRole.ADMIN ||
    res.locals?.authRole === UserRole.QUANTIFIER
  ) {
    user.ethereumAddress = ethereumAddress;
  }

  return user;
};

export const userListTransformer = (
  res: Response,
  userDocs: PaginationModel<UserDocument>
): PaginatedResponseBody<User> => {
  const response = {
    ...userDocs,
    docs: userDocs.docs.map((d) => {
      return userDocToUser(res, d);
    }),
  };
  return response;
};

export const userTransformer = (res: Response, data: UserDocument): User => {
  return userDocToUser(res, data);
};
