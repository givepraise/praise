import { Types } from 'mongoose';
import { EventLogModel, EventLogTypeModel } from './entities';
import { EventLogTypeKey } from 'types/dist/eventlog/types';

interface UserInfo {
  userId?: Types.ObjectId;
  userAccountId?: Types.ObjectId;
}

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
