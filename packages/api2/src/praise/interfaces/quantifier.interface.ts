import { UserAccount } from '@/useraccounts/schemas/useraccounts.schema';
import { Receiver } from './receiver.interface';

export interface Quantifier {
  _id: string;
  accounts: UserAccount[];
  receivers: Receiver[];
}
