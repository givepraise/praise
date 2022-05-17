import {
  BadRequestError,
  InternalServerError,
  NotFoundError,
} from '@error/errors';
import { PeriodDocument, PeriodDateRange } from '@period/types';
import { findActivePeriods, getPeriodDateRangeQuery } from '@period/utils';
import { countPraiseWithinDateRanges } from '@praise/utils/core';
import {
  QueryInputParsedQs,
  SearchQueryInputParsedQs,
  TypedRequestBody,
  TypedRequestQuery,
  TypedResponse,
} from '@shared/types';
import { EventLogTypeKey } from '@eventlog/types';
import { logEvent } from '@eventlog/utils';
import { Request } from 'express';
import mongoose, { Types } from 'mongoose';
import { UserModel } from './entities';
import { userListTransformer, userTransformer } from './transformers';
import { UserDocument, UserDto, UserRole, UserRoleChangeInput } from './types';

/**
 * Description
 * @param
 */
const all = async (
  req: TypedRequestQuery<QueryInputParsedQs>,
  res: TypedResponse<UserDto[]>
): Promise<void> => {
  const users: UserDocument[] = await UserModel.aggregate([
    {
      $lookup: {
        from: 'useraccounts',
        localField: '_id',
        foreignField: 'user',
        as: 'accounts',
      },
    },
  ]);
  if (!users) throw new InternalServerError('No users found');
  res.status(200).json(userListTransformer(res, users));
};

const findUser = async (id: string): Promise<UserDocument> => {
  const users: UserDocument[] = await UserModel.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(id) } },
    {
      $lookup: {
        from: 'useraccounts',
        localField: '_id',
        foreignField: 'user',
        as: 'accounts',
      },
    },
  ]);
  if (!Array.isArray(users) || users.length === 0)
    throw new NotFoundError('User');
  return users[0];
};

/**
 * Description
 * @param
 */
const single = async (
  req: Request,
  res: TypedResponse<UserDto>
): Promise<void> => {
  const { id } = req.params;
  const user = await findUser(id);
  res.status(200).json(userTransformer(res, user));
};

/**
 * Description
 * @param
 */
const search = async (
  req: TypedRequestQuery<SearchQueryInputParsedQs>,
  res: TypedResponse<UserDto[]>
): Promise<void> => {
  //TODO Support searching more than eth address
  const users: UserDocument[] = await UserModel.aggregate([
    { $match: { ethereumAddress: { $regex: req.query.search } } },
    {
      $lookup: {
        from: 'UserAccount',
        localField: '_id',
        foreignField: 'user',
        as: 'accounts',
      },
    },
  ]);
  if (!Array.isArray(users) || users.length === 0)
    throw new NotFoundError('User');
  res.status(200).json(userListTransformer(res, users));
};

/**
 * Description
 * @param
 */
const addRole = async (
  req: TypedRequestBody<UserRoleChangeInput>,
  res: TypedResponse<UserDto>
): Promise<void> => {
  const { id } = req.params;
  const user = await UserModel.findById(id);
  if (!user) throw new NotFoundError('User');

  const { role } = req.body;
  if (!role) throw new BadRequestError('Role is required');
  if (!(role in UserRole)) throw new BadRequestError('Invalid role');

  if (!user.roles.includes(role)) {
    user.roles.push(role);
    user.accessToken = undefined;
    user.nonce = undefined;
    await user.save();
  }

  await logEvent(
    EventLogTypeKey.PERMISSION,
    `Added role "${role}" to user with id "${(
      user._id as Types.ObjectId
    ).toString()}"`,
    {
      userId: res.locals.currentUser._id,
    }
  );

  const userWithDetails = await findUser(id);
  res.status(200).json(userTransformer(res, userWithDetails));
};

/**
 * Description
 * @param
 */
const removeRole = async (
  req: TypedRequestBody<UserRoleChangeInput>,
  res: TypedResponse<UserDto>
): Promise<void> => {
  const { id } = req.params;
  const user = await UserModel.findById(id);
  if (!user) throw new NotFoundError('User');

  const { role } = req.body;
  if (!role) throw new BadRequestError('Role is required');

  const roleIndex = user.roles.indexOf(role);

  // If user is currently assigned to the active quantification round, and role is QUANTIFIER throw error
  const activePeriods: PeriodDocument[] = await findActivePeriods();

  if (
    roleIndex > -1 &&
    role === UserRole.QUANTIFIER &&
    activePeriods.length > 0
  ) {
    const dateRanges: PeriodDateRange[] = await Promise.all(
      activePeriods.map((period) => getPeriodDateRangeQuery(period))
    );
    const assignedPraiseCount = await countPraiseWithinDateRanges(dateRanges, {
      'quantifications.quantifier': user._id,
    });
    if (assignedPraiseCount > 0)
      throw new BadRequestError(
        'Cannot remove quantifier currently assigned to quantification period'
      );
  }

  if (roleIndex > -1) {
    user.roles.splice(roleIndex, 1);
    user.accessToken = undefined;
    user.nonce = undefined;
    await user.save();

    await logEvent(
      EventLogTypeKey.PERMISSION,
      `Removed role "${role}" from user with id "${(
        user._id as Types.ObjectId
      ).toString()}`,
      {
        userId: res.locals.currentUser._id,
      }
    );
  }

  const userWithDetails = await findUser(id);
  res.status(200).json(userTransformer(res, userWithDetails));
};

export { all, single, search, addRole, removeRole };
