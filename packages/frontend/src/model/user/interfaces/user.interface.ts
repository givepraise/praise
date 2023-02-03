import { UserAccount } from '@/model/useraccount/interfaces/useraccount.interface';
import { UserRole } from '../enums/user-role.enum';

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
