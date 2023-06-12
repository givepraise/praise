import { AuthRole } from '../enums/auth-role.enum';

export interface JwtPayload {
  userId: string;
  identityEthAddress: string;
  roles: AuthRole[];
  type: 'access' | 'refresh';
  hostname: string;
}
