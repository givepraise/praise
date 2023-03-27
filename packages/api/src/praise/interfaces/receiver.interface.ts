import { Types } from 'mongoose';

export interface Receiver {
  _id: Types.ObjectId;
  praiseCount: number;
  praiseIds: Types.ObjectId[];
  assignedQuantifiers?: number;
}
