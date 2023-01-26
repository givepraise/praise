import { UserAccountPlatform } from 'shared/types/user-account-platform.type';
import { User } from './user.interface';

export interface UserAccount {
  user?: User;
  accountId: string;
  name: string;
  avatarId?: string;
  platform: UserAccountPlatform;
  activateToken?: string;
  createdAt: Date;
  updatedAt: Date;
}
