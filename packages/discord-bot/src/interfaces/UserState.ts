import { UserAccountPlatform } from 'types/dist/useraccount';
import { UserRole } from 'types/dist/user';

interface ActivatedAccount {
  platform: UserAccountPlatform;
  user: string;
  activationDate: Date;
  latestUsageDate: Date;
}

export interface UserState {
  id: string;
  username: string;
  hasPraiseGiverRole: boolean;
  activated: boolean;
  avatar?: string;
  address?: string;
  praiseRoles?: UserRole[];
  activations?: ActivatedAccount[];
}
