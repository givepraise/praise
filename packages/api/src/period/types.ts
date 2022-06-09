import { Query } from '@shared/types';

export interface PeriodReceiverPraiseInput extends Query {
  receiverId?: string;
}

export interface PeriodQuantifierPraiseInput extends Query {
  quantifierId?: string;
}
