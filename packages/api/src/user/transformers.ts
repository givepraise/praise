import { Types } from 'mongoose';
import { userAccountListTransformer } from '@/useraccount/transformers';
import { PraiseModel } from '@/praise/entities';
import { calculateUserTotalScore } from '@/praise/utils/score';
import { UserDetailsDto, UserDocument, UserDto, UserRole } from './types';

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
 * Serialize a User
 *
 * @param {UserDocument} userDocument
 * @param {UserRole[]} [currentUserRoles=[UserRole.USER]]
 * @returns {Promise<UserDto>}
 */
export const userDetailTransformer = async (
  userDocument: UserDocument
): Promise<UserDetailsDto> => {
  const user = userTransformer(userDocument) as UserDetailsDto;
  const account = user.accounts?.[0];

  if (!account) return user;

  const receivedPraiseItems = await PraiseModel.find({
    receiver: new Types.ObjectId(account._id),
  });

  const givenPraiseItems = await PraiseModel.find({
    giver: new Types.ObjectId(account._id),
  });

  user.praiseStatistics = {
    receivedTotalScore: await calculateUserTotalScore(receivedPraiseItems),
    givenTotalScore: await calculateUserTotalScore(givenPraiseItems),
  };

  return user;
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
