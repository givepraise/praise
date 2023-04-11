import { AuthRole } from '../../auth/enums/auth-role.enum';

export class CreateUserInputDto {
  identityEthAddress: string;
  rewardsEthAddress: string;
  username: string;
  roles: AuthRole[];
  nonce?: string;
}
