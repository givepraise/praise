import { UserAccountDocument, UserAccountDto } from './types';
import { generateUserAccountNameRealized } from './utils';

/**
 * Serialize a UserAccount
 *
 * @param {UserAccountDocument} userAccountDocument
 * @returns {UserAccountDto}
 */
const userAccountDocumentToDto = (
  userAccountDocument: UserAccountDocument
): UserAccountDto => {
  const {
    _id,
    user,
    accountId,
    name,
    avatarId,
    platform,
    createdAt,
    updatedAt,
  } = userAccountDocument;
  return {
    _id,
    user: user?._id,
    accountId,
    name,
    nameRealized: generateUserAccountNameRealized(userAccountDocument),
    avatarId,
    platform,
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
  };
};

/**
 * Serialize a list of UserAccounts
 *
 * @param {(UserAccountDocument[] | undefined)} userAccountDocuments
 * @returns {UserAccountDto[]}
 */
export const userAccountListTransformer = (
  userAccountDocuments: UserAccountDocument[] | undefined
): UserAccountDto[] => {
  if (userAccountDocuments && Array.isArray(userAccountDocuments)) {
    return userAccountDocuments.map((d) => userAccountDocumentToDto(d));
  }
  return [];
};

/**
 * Serialize a UserAccount
 *
 * @param {UserAccountDocument} userAccountDocument
 * @returns {UserAccountDto}
 */
export const userAccountTransformer = (
  userAccountDocument: UserAccountDocument
): UserAccountDto => {
  return userAccountDocumentToDto(userAccountDocument);
};
