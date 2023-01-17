import { UserAccountDto } from '@/model/useraccount/useraccount.dto';

export interface PeriodDetailsGiverReceiverDto {
  _id: string;
  praiseCount: number;
  score: number;
  userAccount?: UserAccountDto;
}
