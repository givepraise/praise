import { UserAccountDto } from '../useraccount/useraccount.dto';

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
