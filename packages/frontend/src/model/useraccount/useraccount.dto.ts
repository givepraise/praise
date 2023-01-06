import { UserAccountPlatform } from './useraccount-platform.type';
import { UserDto } from '@/model/user/dto/user.dto';

export interface UserAccountDto {
  _id: string;
  user?: string | UserDto;
  username?: string;
  accountId: string;
  name: string;
  nameRealized: string;
  avatarId?: string;
  platform: UserAccountPlatform;
  activateToken?: string;
  createdAt: string;
  updatedAt: string;
}
