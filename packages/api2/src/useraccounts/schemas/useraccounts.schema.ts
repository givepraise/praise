import { Type } from 'class-transformer';
import { SchemaTypes, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';
import { User } from '@/users/schemas/users.schema';
import { ExposeId } from '@/shared/expose-id.decorator';

export type UserAccountDocument = UserAccount & Document;

@Schema({ timestamps: true })
export class UserAccount {
  constructor(partial?: Partial<UserAccount>) {
    if (partial) Object.assign(this, partial);
  }

  @ApiResponseProperty({
    example: '63b428f7d9ca4f6ff5370d05',
  })
  @ExposeId()
  _id: Types.ObjectId;

  @ApiProperty({
    type: User,
  })
  @Prop({ type: SchemaTypes.ObjectId, ref: 'User', default: null, index: true })
  @Type(() => User)
  user: User | Types.ObjectId;

  @ApiResponseProperty({
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
    example: '098098098087097',
  })
  @Prop()
  avatarId: string;

  @ApiResponseProperty({
    example: 'DISCORD',
  })
  @Prop({ type: String, required: true })
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
