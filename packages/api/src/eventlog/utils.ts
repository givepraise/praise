import { Types } from 'mongoose';
import { EventLogModel, EventLogTypeModel } from './entities';
import { EventLogTypeKey } from './types';

interface UserInfo {
  userId?: Types.ObjectId;
  userAccountId?: Types.ObjectId;
}

/**
 * Create a new EventLog for a given event,
 *  intended to represent a user-initiated action in the system,
 *  for community transparency
 *
 * @param {EventLogTypeKey} typeKey
 * @param {string} description
 * @param {UserInfo} [userInfo={}]
 * @param {(Types.ObjectId | undefined)} [periodId=undefined]
 * @returns {Promise<void>}
 */
export const logEvent = async (
  typeKey: EventLogTypeKey,
  description: string,
  userInfo: UserInfo = {},
  periodId: Types.ObjectId | undefined = undefined
): Promise<void> => {
  const type = await EventLogTypeModel.findOne({
    key: typeKey.toString(),
  }).orFail();

  const data = {
    type: type._id,
    description,
    user: userInfo.userId ? userInfo.userId : undefined,
    useraccount: userInfo.userAccountId ? userInfo.userAccountId : undefined,
    period: periodId,
  };

  await EventLogModel.create(data);
};
