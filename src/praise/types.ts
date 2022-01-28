import { UserAccountInterface } from '@entities/UserAccount';

export interface QuantificationCreateUpdateInput {
  score: number;
  dismissed: boolean;
  duplicatePraiseId: string;
}

export interface PraiseImportInput {
  createdAt: string;
  giver: UserAccountInterface;
  receiver: UserAccountInterface;
  reason: string;
  sourceId: string;
  sourceName: string;
}
