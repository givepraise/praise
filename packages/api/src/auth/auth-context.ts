import { AuthRole } from './enums/auth-role.enum';

export class AuthContext {
  userId?: string;
  identityEthAddress?: string;
  apiKey?: string;
  apiKeyId?: string;
  roles: AuthRole[];
}
