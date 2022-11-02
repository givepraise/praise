import { Types } from 'mongoose';
import { EventLogTypeKey } from '../interfaces';

export class CreateEventLogDto {
  typeKey: EventLogTypeKey;
  description: string;
  userInfo: any;
  periodId: Types.ObjectId;
}
