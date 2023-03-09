import { User } from '@/model/user/dto/user.dto';

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
