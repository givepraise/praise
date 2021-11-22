import { Source } from "./source";
import { UserAccount } from "./users";

export interface QuantifiedPraise {
  id: number;
}

export interface Praise {
  id: number;
  createdAt: string;
  updatedAt: string;
  periodId?: number;
  reason: string;
  quantifiedPraises?: QuantifiedPraise[];
  giver: UserAccount;
  recipient: UserAccount;
  source: Source;
}
