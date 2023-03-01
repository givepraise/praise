import { PartialType } from '@nestjs/mapped-types';
import { UserAccount } from '../schemas/useraccounts.schema';

export class UpdateUserAccountInputRequestDto {
  name?: string;
  avatarId?: string;
  platform?: string;
}

export class UpdateUserAccountInputDto extends PartialType(UserAccount) {}
