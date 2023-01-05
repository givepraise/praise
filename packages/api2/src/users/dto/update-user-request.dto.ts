import { PickType } from '@nestjs/swagger';
import { User } from '../schemas/users.schema';

export class UpdateUserRequestDto extends PickType(User, [
  'rewardsEthAddress',
  'username',
]) {}
