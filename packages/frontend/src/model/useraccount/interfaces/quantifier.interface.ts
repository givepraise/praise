import { Receiver } from './receiver.interface';
import { UserAccount } from '../dto/user-account.dto';

export interface Quantifier {
  _id: string;
  accounts: UserAccount[];
  receivers: Receiver[];
}
