import { QueryInput } from '@/shared/types.shared';

export interface PraiseAllInput extends QueryInput {
  receiver?: string;
  giver?: string;
}
