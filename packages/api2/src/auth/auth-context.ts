import { Types } from 'mongoose';
import { AuthRole } from './enums/auth-role.enum';

export class AuthContext {
  userId?: Types.ObjectId;
  identityEthAddress?: string;
  apiKeyId?: Types.ObjectId;
  roles: AuthRole[];
}
