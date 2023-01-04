import { Transform } from 'class-transformer';
import { SchemaTypes, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Platform } from '../interfaces/platform/platform.interface';
import { ApiResponseProperty } from '@nestjs/swagger';

export type UserAccountDocument = UserAccount & Document;

@Schema({ timestamps: true })
export class UserAccount {
  constructor(partial?: Partial<UserAccount>) {
    if (partial) Object.assign(this, partial);
  }

  @ApiResponseProperty({
    example: '63b428f7d9ca4f6ff5370d05',
  })
  @Transform(({ value }) => value.toString())
  _id: Types.ObjectId;

  @ApiResponseProperty({
    example: '63b428f7d9ca4f6ff5370d0a',
  })
  @Transform(({ value }) => value.toString())
  @Prop({ type: SchemaTypes.ObjectId, ref: 'User', default: null, index: true })
  user: Types.ObjectId;

  @ApiResponseProperty({
    type: 'Unique platform specific account id',
    example: '098098098098098',
  })
  @Prop({ required: true, unique: true, index: true })
  accountId: string;

  @ApiResponseProperty({
    example: 'darth#6755',
  })
  @Prop({ required: true })
  name: string;

  @ApiResponseProperty({
    type: 'Platform specific avatar id',
    example: '098098098087097',
  })
  @Prop()
  avatarId: string;

  @ApiResponseProperty({
    example: 'DISCORD',
  })
  @Prop({ type: String, enum: Platform, required: true })
  platform: string;

  @Prop({ select: false })
  activateToken: string;

  @ApiResponseProperty()
  @Prop()
  createdAt: Date;

  @ApiResponseProperty()
  @Prop()
  updatedAt: Date;
}

export const UserAccountSchema = SchemaFactory.createForClass(UserAccount);
