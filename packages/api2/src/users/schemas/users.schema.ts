import { Exclude, Type } from 'class-transformer';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Types } from 'mongoose';
import { AuthRole } from '@/auth/enums/auth-role.enum';
import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';
import { ExposeId } from '@/shared/decorators/expose-id.decorator';
import { UserAccountNoUserId } from '@/useraccounts/dto/useraccount-no-user-id.dto';
import { IsOptional, IsString } from 'class-validator';
import { IsEthAddress } from '@/shared/validators.shared';
import { isValidUsername } from '../utils/is-valid-username';

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
    type: 'string',
  })
  @ExposeId()
  _id: Types.ObjectId;

  @ApiResponseProperty({
    example: '0xAAB27b150451726EC7738aa1d0A94505c8729bd1',
    type: 'string',
  })
  @Prop({ required: true, unique: true, index: true })
  identityEthAddress: string;

  @ApiProperty({
    example: '0xAAB27b150451726EC7738aa1d0A94505c8729bd1',
    type: 'string',
  })
  @IsOptional()
  @IsEthAddress()
  @Prop({ required: true })
  rewardsEthAddress: string;

  @ApiProperty({
    example: 'darth',
    type: 'string',
  })
  @IsOptional()
  @IsString()
  @Prop({
    required: true,
    unique: true,
    minlength: 4,
    maxlength: 20,
    validate: {
      validator: (username: string) =>
        Promise.resolve(isValidUsername(username)),
      message:
        'Invalid username, only alphanumeric characters, underscores, dots, and hyphens are allowed.',
    },
  })
  username: string;

  @ApiResponseProperty({
    example: ['USER'],
    type: ['string'],
  })
  @Prop({
    type: [String],
    enum: [AuthRole],
    default: [AuthRole.USER],
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

  @ApiResponseProperty({ type: Date })
  @Prop()
  createdAt: Date;

  @ApiResponseProperty({ type: Date })
  @Prop()
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.virtual('accounts', {
  ref: 'UserAccount',
  localField: '_id',
  foreignField: 'user',
});

export const UsersExportSqlSchema = `
 _id VARCHAR, 
 username VARCHAR, 
 "identityEthAddress" VARCHAR, 
 "rewardsEthAddress" VARCHAR, 
 roles VARCHAR, 
 "createdAt" TIMESTAMP, 
 "updatedAt" TIMESTAMP
`;
