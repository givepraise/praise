import { UserAccountDto } from '@/model/useraccount/dto/useraccount.dto';
import { EventLogTypeDto } from './event-log-type.dto';

export interface EventLogDto {
  user?: string;
  useraccount?: UserAccountDto;
  type: EventLogTypeDto;
  description: string;
  hidden: boolean;
  createdAt: string;
  updatedAt: string;
}
