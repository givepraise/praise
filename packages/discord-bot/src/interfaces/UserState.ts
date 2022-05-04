import { UserAccountPlatform } from 'api/dist/useraccount/types';
import { UserRole } from 'api/dist/user/types';

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
