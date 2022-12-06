import { UserRole } from '@/users/interfaces/user-role.interface';

export interface JwtPayload {
  userId: string;
  identityEthAddress: string;
  roles: UserRole[];
}
