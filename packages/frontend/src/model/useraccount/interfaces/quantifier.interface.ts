import { Receiver } from './receiver.interface';
import { UserAccount } from './useraccount.interface';

export interface Quantifier {
  _id: string;
  accounts: UserAccount[];
  receivers: Receiver[];
}
