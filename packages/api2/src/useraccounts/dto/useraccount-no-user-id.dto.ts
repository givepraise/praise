import { OmitType } from '@nestjs/swagger';
import { UserAccount } from '../schemas/useraccounts.schema';

export class UserAccountNoUserId extends OmitType(UserAccount, [
  'user',
] as const) {}
