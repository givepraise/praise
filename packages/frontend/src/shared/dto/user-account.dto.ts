import { UserAccountPlatform } from 'shared/types/user-account-platform.type';

export interface UserAccountDto {
  _id: string;
  user?: string;
  accountId: string;
  name: string;
  nameRealized: string;
  avatarId?: string;
  platform: UserAccountPlatform;
  activateToken?: string;
  createdAt: string;
  updatedAt: string;
}
