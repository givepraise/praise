import { UserAccountDto } from '@/model/useraccount/dto/useraccount.dto';

export interface UserDto {
  _id: string;
  identityEthAddress: string;
  rewardsEthAddress: string;
  username: string;
  roles: string[];
  accounts?: UserAccountDto[];
  nonce?: string;
  accessToken?: string;
  createdAt: string;
  updatedAt: string;
}
