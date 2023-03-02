import { Receiver } from './receiver.interface';
import { UserAccount } from '../dto/useraccount.dto';

export interface Quantifier {
  _id: string;
  accounts: UserAccount[];
  receivers: Receiver[];
}
