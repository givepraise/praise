import { UserRole } from '@/users/interfaces/userRole.interface';

export interface JwtPayload {
  userId: string;
  identityEthAddress: string;
  roles: UserRole[];
}
