import { Exclude, Transform } from 'class-transformer';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Types } from 'mongoose';
import { UserAccount } from '@/useraccounts/schemas/useraccounts.schema';
import { AuthRole } from '@/auth/enums/auth-role.enum';
import { ApiResponseProperty } from '@nestjs/swagger';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  constructor(partial?: Partial<User>) {
    if (partial) {
      Object.assign(this, partial);
      if (partial.accounts) {
        this.accounts = partial.accounts.map(
          (account) => new UserAccount(account),
        );
      }
    }
  }

  @ApiResponseProperty({
    example: '5f9f1b9b9b9b9b9b9b9b9b9b',
  })
  @Transform(({ value }) => value.toString())
  _id: Types.ObjectId;

  @ApiResponseProperty({
    example: '0xAAB27b150451726EC7738aa1d0A94505c8729bd1',
  })
  @Prop({ required: true, unique: true, index: true })
  identityEthAddress: string;

  @ApiResponseProperty({
    example: '0xAAB27b150451726EC7738aa1d0A94505c8729bd1',
  })
  @Prop({ required: true })
  rewardsEthAddress: string;

  @ApiResponseProperty({
    example: 'darth',
  })
  @Prop({ required: true, unique: true })
  username: string;

  @ApiResponseProperty({
    example: '["USER"]',
  })
  @Prop({
    type: [
      {
        type: String,
        enum: [AuthRole],
      },
    ],
    default: [AuthRole.USER],
    enum: [AuthRole],
  })
  roles: string[];

  @ApiResponseProperty({
    type: [UserAccount],
  })
  accounts: UserAccount[];

  @Exclude()
  @Prop()
  nonce?: string;

  @Exclude()
  @Prop()
  accessToken?: string;

  @Exclude()
  @Prop()
  refreshToken?: string;

  @ApiResponseProperty()
  @Prop()
  createdAt: Date;

  @ApiResponseProperty()
  @Prop()
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.virtual('accounts', {
  ref: 'UserAccount',
  localField: '_id',
  foreignField: 'user',
});
