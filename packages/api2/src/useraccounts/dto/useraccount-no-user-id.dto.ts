import { ApiHideProperty } from '@nestjs/swagger';
import { UserAccount } from '../schemas/useraccounts.schema';
import { Types } from 'mongoose';
import { Exclude } from 'class-transformer';

export class UserAccountNoUserId extends UserAccount {
  @ApiHideProperty()
  @Exclude()
  user: Types.ObjectId;
}
