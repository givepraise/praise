import { userAccountListTransformer } from '@/useraccount/transformers';
import { UserDocument, UserDto, UserRole } from './types';
import { generateUserName } from './utils/entity';

/**
 * Serialize a User
 *
 * @param {UserDocument} userDocument
 * @param {UserRole[]} [currentUserRoles=[UserRole.USER]]
 * @returns {Promise<UserDto>}
 */
export const userTransformer = async (
  userDocument: UserDocument,
  currentUserRoles: UserRole[] = [UserRole.USER]
): Promise<UserDto> => {
  const { _id, roles, createdAt, updatedAt } = userDocument;

  /* Only return eth address to admin or quantifier */
  let identityEthAddress;
  if (
    currentUserRoles.includes(UserRole.ADMIN) ||
    currentUserRoles.includes(UserRole.QUANTIFIER)
  ) {
    identityEthAddress = userDocument.identityEthAddress;
  }

  let accounts;
  if (userDocument.accounts) {
    accounts = userAccountListTransformer(userDocument.accounts);
  }

  // Generate user name
  const nameRealized = await generateUserName(userDocument);

  return {
    _id,
    roles,
    identityEthAddress,
    accounts,
    nameRealized,
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
  } as UserDto;
};

/**
 * Serialize a list of Users
 *
 * @param {UserDocument[]} userDocuments
 * @param {UserRole[]} [currentUserRoles=[UserRole.USER]]
 * @returns {Promise<UserDto[]>}
 */
export const userListTransformer = (
  userDocuments: UserDocument[],
  currentUserRoles: UserRole[] = [UserRole.USER]
): Promise<UserDto[]> => {
  return Promise.all(
    userDocuments.map((d) => userTransformer(d, currentUserRoles))
  );
};
