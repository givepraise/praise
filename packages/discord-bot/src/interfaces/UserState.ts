import { UserAccountPlatform } from 'shared/dist/useraccount/types';
import { UserRole } from 'shared/dist/user/types';

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
