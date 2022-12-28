import { AuthRole } from './enums/auth-role.enum';

export class AuthContext {
  userId?: string;
  identityEthAddress?: string;
  roles: AuthRole[];
}
