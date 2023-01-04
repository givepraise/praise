import { Types } from 'mongoose';
import { EventLogTypeKey } from '../enums/event-log-type-key';

export class CreateEventLogInputDto {
  user?: Types.ObjectId;
  userAccount?: Types.ObjectId;
  periodId?: Types.ObjectId;
  typeKey: EventLogTypeKey;
  description: string;
}
