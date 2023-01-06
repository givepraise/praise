import { QuantificationDto } from '../quantification/quantification.dto';
import { UserAccountDto } from '../useraccount/useraccount.dto';

export interface PraiseDto {
  _id: string;
  reasonRaw: string;
  reason: string;
  sourceId: string;
  sourceName: string;
  quantifications: QuantificationDto[];
  giver: UserAccountDto;
  receiver: UserAccountDto;
  forwarder?: UserAccountDto;
  createdAt: string;
  updatedAt: string;
  score: number;
}
