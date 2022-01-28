import mongoose, { Schema } from 'mongoose';
import { mongoosePagination, Pagination } from 'mongoose-paginate-ts';
import { UserAccountInterface } from './UserAccount';

export interface UserInterface extends mongoose.Document {
  ethereumAddress: string;
  accounts: UserAccountInterface[];
  roles: string[];
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
  QUANTIFIER = 'QUANTIFIER',
}

export const userSchema = new mongoose.Schema(
  {
    ethereumAddress: { type: String, required: true },
    accounts: [{ type: Schema.Types.ObjectId, ref: 'UserAccount' }],
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
