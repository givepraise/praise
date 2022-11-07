import { userAccountListTransformer } from '@/useraccount/transformers';
import { UserDetailsDto, UserDocument, UserDto, UserStats } from './types';

/**
 * Serialize a User
 *
 * @param {UserDocument} userDocument
 * @param {UserRole[]} [currentUserRoles=[UserRole.USER]]
 * @returns {Promise<UserDto>}
 */
export const userTransformer = (userDocument: UserDocument): UserDto => {
  const {
    _id,
    roles,
    username,
    createdAt,
    updatedAt,
    identityEthAddress,
    rewardsEthAddress,
  } = userDocument;

  let accounts;
  if (userDocument.accounts) {
    accounts = userAccountListTransformer(userDocument.accounts);
  }

  return {
    _id,
    roles,
    identityEthAddress,
    rewardsEthAddress,
    accounts,
    username,
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
  } as UserDto;
};

/**
 * Serialize a User with Stats
 *
 * @param {UserDocument} userDocument
 * @param {UserRole[]} [currentUserRoles=[UserRole.USER]]
 * @returns {Promise<UserDto>}
 */
export const userDetailTransformer = (
  userDocument: UserDocument,
  userStats: UserStats | null
): UserDetailsDto => {
  const user = userTransformer(userDocument) as UserDetailsDto;

  if (!userStats) return user;

  return {
    ...user,
    ...userStats,
  };
};

/**
 * Serialize a list of Users
 *
 * @param {UserDocument[]} userDocuments
 * @param {UserRole[]} [currentUserRoles=[UserRole.USER]]
 * @returns {Promise<UserDto[]>}
 */
export const userListTransformer = (
  userDocuments: UserDocument[]
): Promise<UserDto[]> => {
  return Promise.all(userDocuments.map((d) => userTransformer(d)));
};
