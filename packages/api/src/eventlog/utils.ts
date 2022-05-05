import { Types } from 'mongoose';
import { EventLogModel, EventLogTypeModel } from './entities';
import { EventLogTypeKey } from './types';

export const logEvent = async (
  userId: Types.ObjectId,
  typeKey: EventLogTypeKey,
  description: string
): Promise<void> => {
  const type = await EventLogTypeModel.findOne({
    key: typeKey.toString(),
  }).orFail();

  await EventLogModel.create({
    user: userId,
    type: type._id,
    description,
  });
};
