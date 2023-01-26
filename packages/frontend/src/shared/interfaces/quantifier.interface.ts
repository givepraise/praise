import { Receiver } from './receiver.interface';
import { UserAccount } from './user-account.interface';

export interface Quantifier {
  _id: string;
  accounts: UserAccount[];
  receivers: Receiver[];
}
