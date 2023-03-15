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
