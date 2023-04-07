import { OmitType } from '@nestjs/swagger';
import { User } from '../schemas/users.schema';

export class UserNoUserAccountsDto extends OmitType(User, [
  'accounts',
] as const) {}
