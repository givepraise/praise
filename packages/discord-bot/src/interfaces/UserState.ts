import { UserAccountPlatform } from 'api/dist/useraccount/types';
import { UserRole } from 'api/dist/user/types';

interface ActivatedAccount {
  platform: string;
  user: string;
  activationDate: string;
  latestUsageDate: string;
}

export interface UserState {
  id: string;
  username: string;
  hasPraiseGiverRole: boolean;
  activated: boolean;
  avatar?: string;
  address?: string;
  praiseRoles?: string[];
  activations?: ActivatedAccount[];
}
