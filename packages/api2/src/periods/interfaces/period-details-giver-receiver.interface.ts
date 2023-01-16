import { Quantification } from '@/quantifications/schemas/quantifications.schema';
import { UserAccount } from '@/useraccounts/schemas/useraccounts.schema';
import { Types } from 'mongoose';

export class PeriodDetailsGiverReceiver {
  _id: Types.ObjectId;
  praiseCount: number;
  quantifications?: Array<Quantification>;
  scoreRealized: number;
  userAccounts: UserAccount[];
}
