import { PickType } from '@nestjs/mapped-types';
import { UserAccount } from '../schemas/useraccounts.schema';

export class CreateUserAccountDto extends PickType(UserAccount, [
  'accountId',
  'name',
  'avatarId',
  'platform',
  'activateToken',
]) {
  userId: string;
}
