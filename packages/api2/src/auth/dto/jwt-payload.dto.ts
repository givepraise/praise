import { UserRole } from '../../users/interfaces/userRole.interface';

export interface JwtPayload {
  userId: string;
  ethereumAddress: string;
  roles: UserRole[];
}
