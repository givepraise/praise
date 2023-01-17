import { Exclude, Type } from 'class-transformer';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Types, model } from 'mongoose';
import { AuthRole } from '@/auth/enums/auth-role.enum';
import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';
import { ExposeId } from '@/shared/expose-id.decorator';
import { UserAccountNoUserId } from '@/useraccounts/dto/useraccount-no-user-id.dto';
import { IsOptional, IsString } from 'class-validator';
import { IsEthAddress } from '@/shared/validators.shared';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  constructor(partial?: Partial<User>) {
    if (partial) {
      Object.assign(this, partial);
      if (partial.accounts) {
        this.accounts = partial.accounts.map(
          (account) => new UserAccountNoUserId(account),
        );
      }
    }
  }

  @ApiResponseProperty({
    example: '5f9f1b9b9b9b9b9b9b9b9b9b',
  })
  @ExposeId()
  _id: Types.ObjectId;

  @ApiResponseProperty({
    example: '0xAAB27b150451726EC7738aa1d0A94505c8729bd1',
  })
  @Prop({ required: true, unique: true, index: true })
  identityEthAddress: string;

  @ApiProperty({
    example: '0xAAB27b150451726EC7738aa1d0A94505c8729bd1',
  })
  @IsOptional()
  @IsEthAddress()
  @Prop({ required: true })
  rewardsEthAddress: string;

  @ApiProperty({
    example: 'darth',
  })
  @IsOptional()
  @IsString()
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
    type: [UserAccountNoUserId],
  })
  @Type(() => UserAccountNoUserId)
  accounts: UserAccountNoUserId[];

  @Exclude()
  @Prop()
  nonce?: string;

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

export const UserModel = model<UserDocument>('User', UserSchema);
