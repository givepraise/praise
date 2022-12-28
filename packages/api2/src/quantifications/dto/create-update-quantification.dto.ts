import { Types } from 'mongoose';

export class CreateUpdateQuantification {
  score?: number;
  dismissed?: boolean;
  duplicatePraise?: Types.ObjectId;
}
