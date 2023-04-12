import { Exclude, Type } from 'class-transformer';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Types } from 'mongoose';
import { AuthRole } from '../../auth/enums/auth-role.enum';
import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';
import { ExposeId } from '../../shared/decorators/expose-id.decorator';
import { IsOptional, IsString } from 'class-validator';
import { IsEthAddress } from '../../shared/validators/is-eth-address.validator';
import { isValidUsername } from '../utils/is-valid-username';
import {
  UserAccount,
  UserAccountNoUserId,
} from '../../useraccounts/schemas/useraccounts.schema';

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
    type: 'string',
  })
  @ExposeId()
  _id: Types.ObjectId;

  @ApiResponseProperty({
    example: '0xAAB27b150451726EC7738aa1d0A94505c8729bd1',
    type: 'string',
  })
  @IsEthAddress()
  @Prop({ required: true, unique: true, index: true, length: 42 })
  identityEthAddress: string;

  @ApiProperty({
    example: '0xAAB27b150451726EC7738aa1d0A94505c8729bd1',
    type: 'string',
    maxLength: 42,
  })
  @IsOptional()
  @IsEthAddress()
  @Prop({ required: true, length: 42 })
  rewardsEthAddress: string;

  @ApiProperty({
    example: 'darth',
    type: 'string',
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  @Prop({
    required: true,
    unique: true,
    minlength: 4,
    maxlength: 50,
    validate: {
      validator: (username: string) =>
        Promise.resolve(isValidUsername(username)),
      message:
        'Invalid username, only alphanumeric characters, underscores, dots, and hyphens are allowed.',
    },
  })
  username: string;

  @ApiResponseProperty({ type: [AuthRole], enum: AuthRole })
  @Prop({
    type: [String],
    enum: AuthRole,
    required: true,
  })
  roles: AuthRole[];

  @ApiResponseProperty({
    type: () => [UserAccount],
  })
  @Type(() => UserAccountNoUserId)
  accounts: UserAccountNoUserId[];

  @Exclude()
  @Prop({ maxlength: 255, required: false })
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
