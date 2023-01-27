import { User } from '@/model/user/interfaces/user.interface';

export interface UserAccount {
  user?: User;
  accountId: string;
  name: string;
  avatarId?: string;
  platform: string;
  activateToken?: string;
  createdAt: Date;
  updatedAt: Date;
}
