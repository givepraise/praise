import { Exclude, Transform } from 'class-transformer';
import { Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { UserAccount } from '../../useraccounts/schemas/useraccounts.schema';
import { UserRole } from '../interfaces/userRole.interface';

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

  @Transform(({ value }) => value.toString())
  _id: Types.ObjectId;

  @Prop({ required: true, unique: true })
  ethereumAddress: string;

  @Prop({
    type: [
      {
        type: String,
        enum: [UserRole],
      },
    ],
    default: [UserRole.USER],
    enum: [UserRole],
  })
  roles: string[];

  accounts: UserAccount[];

  @Exclude()
  @Prop({ select: false })
  nonce: string;

  @Exclude()
  @Prop({ select: false })
  accessToken: string;

  @Exclude()
  @Prop({ select: false })
  refreshToken: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.virtual('accounts', {
  ref: 'UserAccount',
  localField: '_id',
  foreignField: 'user',
});
