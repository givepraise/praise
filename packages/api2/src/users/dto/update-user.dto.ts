// import { PartialType } from '@nestjs/mapped-types';
// import { User } from '../schemas/users.schema';

// // export class UpdateUserDto extends PartialType(User) {}

import { Prop } from '@nestjs/mongoose';

export class UpdateUserDto {
  @Prop({ required: true })
  rewardsEthAddress: string;

  @Prop({ required: true, unique: true })
  username: string;
}
