import { UserAccount } from '../../useraccounts/schemas/useraccounts.schema';
import { Receiver } from './receiver.interface';
import { Types } from 'mongoose';

export interface Quantifier {
  _id: Types.ObjectId;
  accounts: UserAccount[];
  receivers: Receiver[];
}
