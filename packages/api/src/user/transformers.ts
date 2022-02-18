import { userAccountListTransformer } from '@useraccount/transformers';
import { Response } from 'express';
import { UserDocument, UserDto, UserRole } from './types';

const userDocumentToUserDto = (
  res: Response,
  userDocument: UserDocument
): UserDto => {
  const { _id, roles, createdAt, updatedAt, ethereumAddress, accounts } =
    userDocument;

  const user: UserDto = {
    _id,
    roles,
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
  };

  /* Only return eth address to admin or quantifier */
  if (
    res.locals?.authRole === UserRole.ADMIN ||
    res.locals?.authRole === UserRole.QUANTIFIER
  ) {
    user.ethereumAddress = ethereumAddress;
  }

  if (accounts) {
    user.accounts = userAccountListTransformer(accounts);
  }
  return user;
};

export const userListTransformer = (
  res: Response,
  userDocuments: UserDocument[]
): UserDto[] => {
  if (userDocuments && Array.isArray(userDocuments)) {
    return userDocuments.map((d) => userDocumentToUserDto(res, d));
  }
  return [];
};

export const userTransformer = (
  res: Response,
  userDocument: UserDocument
): UserDto => {
  return userDocumentToUserDto(res, userDocument);
};
