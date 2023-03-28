import { Exclude, Type } from 'class-transformer';
import { Types, SchemaTypes } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty, ApiResponseProperty, OmitType } from '@nestjs/swagger';
import { User } from '../../users/schemas/users.schema';
import { ExposeId } from '../../shared/decorators/expose-id.decorator';
import { IsOptional, IsString } from 'class-validator';
import { has } from 'lodash';
import { IsObjectId } from '../../shared/validators/is-object-id.validator';

export type UserAccountDocument = UserAccount & Document;

@Schema({ timestamps: true })
export class UserAccount {
  constructor(partial?: Partial<UserAccount>) {
    if (partial) {
      Object.assign(this, partial);
      this.user = has(this.user, '_id') ? new User(this.user) : this.user;
    }
  }

  @ApiResponseProperty({
    example: '63b428f7d9ca4f6ff5370d05',
    type: 'string',
  })
  @ExposeId()
  _id: Types.ObjectId;

  @ApiProperty({
    example: '63b428f7d9ca4f6ff5370d05',
    type: 'string',
    required: false,
  })
  @ExposeId()
  @Type(() => User)
  @IsOptional()
  @IsObjectId()
  @Prop({
    type: SchemaTypes.ObjectId,
    ref: 'User',
    default: null,
    index: true,
    required: false,
  })
  user?: User | Types.ObjectId;

  @ApiProperty({
    example: '098098098098098',
    type: 'string',
    minLength: 10,
    maxLength: 255,
  })
  @IsString()
  @Prop({
    required: true,
    index: true,
    minlength: 10,
    maxlength: 255,
  })
  accountId: string;

  @ApiProperty({
    example: 'darth#6755',
    type: 'string',
    minLength: 4,
    maxLength: 20,
  })
  @IsString()
  @Prop({ required: true, minlength: 4, maxlength: 20 })
  name: string;

  @ApiProperty({
    example: '098098098087097',
    type: 'string',
    minLength: 10,
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @Prop({ type: String, required: false, minlength: 10, maxlength: 255 })
  avatarId?: string;

  @ApiProperty({
    example: 'DISCORD',
    type: 'string',
    minLength: 4,
    maxLength: 255,
  })
  @Prop({ type: String, required: true, minlength: 4, maxlength: 255 })
  @IsString()
  platform: string;

  @Exclude()
  @Prop({ type: String, maxlength: 255, required: false })
  activateToken?: string;

  @ApiResponseProperty({ type: Date })
  @Prop()
  createdAt: Date;

  @ApiResponseProperty({ type: Date })
  @Prop()
  updatedAt: Date;
}

export const UserAccountSchema = SchemaFactory.createForClass(UserAccount);

export const UserAccountsExportSqlSchema = `
  _id VARCHAR, 
  "accountId" VARCHAR, 
  "user" VARCHAR, 
  "name" VARCHAR, 
  "avatarId" VARCHAR, 
  platform VARCHAR, 
  "createdAt" TIMESTAMP, 
  "updatedAt" TIMESTAMP
`;

// Importing this class from another file causes the error:
// TypeError: Cannot read properties of undefined (reading 'prototype')
// TODO: Figure out why this is happening
export class UserAccountNoUserId extends OmitType(UserAccount, [
  'user',
] as const) {}
