import { Types } from 'mongoose';
import { EventLogTypeKey } from '../enums/event-log-type-key';
import { AuthContext } from '../../auth/auth-context';

export class CreateEventLogWithAuthContextInputDto {
  authContext: AuthContext;
  period?: Types.ObjectId;
  typeKey: EventLogTypeKey;
  description: string;
}
