import { Transform } from 'class-transformer';
import { SchemaTypes, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Platform } from '../interfaces/platform/platform.interface';

export type UserAccountDocument = UserAccount & Document;

@Schema({ timestamps: true })
export class UserAccount {
  constructor(partial?: Partial<UserAccount>) {
    if (partial) Object.assign(this, partial);
  }

  @Transform(({ value }) => value.toString())
  _id: Types.ObjectId;

  @Transform(({ value }) => value.toString())
  @Prop({ type: SchemaTypes.ObjectId, ref: 'User', default: null })
  user: Types.ObjectId;

  @Prop({ required: true, unique: true, index: true })
  accountId: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  avatarId: string;

  @Prop({ type: String, enum: Platform, required: true })
  platform: string;

  @Prop({ select: false })
  activateToken: string;
}

export const UserAccountSchema = SchemaFactory.createForClass(UserAccount);
