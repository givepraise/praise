import { UserRole } from 'shared/enums/user-role.enum';
import { UserAccount } from './user-account.interface';

export interface User {
  identityEthAddress: string;
  rewardsEthAddress: string;
  username: string;
  roles: UserRole[];
  accounts?: UserAccount[];
  nonce?: string;
  accessToken?: string;
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
}
