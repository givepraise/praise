import { UserDto } from '@/model/user/dto/user.dto';

export interface UserAccountDto {
  _id: string;
  user?: string | UserDto;
  accountId: string;
  name: string;
  avatarId: string;
  platform: string;
  activateToken?: string;
  praiseCount: number;
  score: number;
  createdAt: string;
  updatedAt: string;
}
