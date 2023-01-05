import { Quantification } from '@/quantifications/schemas/quantifications.schema';
import { UserAccount } from '@/useraccounts/schemas/useraccounts.schema';
import { Types } from 'mongoose';

export interface PeriodDetailsGiverReceiver {
  _id: Types.ObjectId;
  praiseCount: number;
  quantifications?: Array<Array<Quantification>>;
  scoreRealized: number;
  userAccounts: UserAccount[];
}
