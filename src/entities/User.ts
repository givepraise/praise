import mongoose from 'mongoose';
import { mongoosePagination, Pagination } from 'mongoose-paginate-ts';
import { userAccountSchema, UserAccountInterface } from './UserAccount';

export interface UserInterface extends mongoose.Document {
  ethereumAddress: string;
  accounts: Array<UserAccountInterface>;
  roles: Array<string>;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  admin = 'ADMIN',
  user = 'USER',
  quantifier = 'QUANTIFIER',
}

export const userSchema = new mongoose.Schema(
  {
    ethereumAddress: { type: String, required: true },
    accounts: [userAccountSchema],
    roles: {
      type: [
        {
          type: String,
          enum: [UserRole],
        },
      ],
      default: ['USER'],
    },
    nonce: { type: String, select: false },
    accessToken: { type: String, select: false },
  },
  {
    timestamps: true,
  }
);

userSchema.plugin(mongoosePagination);

const UserModel = mongoose.model<UserInterface, Pagination<UserInterface>>(
  'User',
  userSchema
);

export default UserModel;
