import { Types } from 'mongoose';
import { EventLogModel, EventLogTypeModel } from './entities';

export const logEvent = async (
  userId: Types.ObjectId,
  typeKey: string,
  description: string
): Promise<void> => {
  const type = await EventLogTypeModel.findOne({ key: typeKey }).orFail();

  await EventLogModel.create({
    user: userId,
    type: type._id,
    description,
  });
};
