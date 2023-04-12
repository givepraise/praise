import { Types } from 'mongoose';
import { EventLogTypeKey } from '../enums/event-log-type-key';

export class CreateEventLogInputDto {
  user?: Types.ObjectId | undefined;
  userAccount?: Types.ObjectId | undefined;
  apiKey?: Types.ObjectId | undefined;
  period?: Types.ObjectId;
  typeKey: EventLogTypeKey;
  description: string;
}
