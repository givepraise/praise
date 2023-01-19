import { ApiResponseProperty } from '@nestjs/swagger';
import { UserAccount } from '../schemas/useraccounts.schema';
import { Types } from 'mongoose';
import { ExposeId } from '@/shared/expose-id.decorator';

export class UserAccountWithUserRefDto extends UserAccount {
  @ApiResponseProperty({ example: '621f802b813dbdba9eeaf7d7' })
  @ExposeId()
  user: Types.ObjectId;
}
