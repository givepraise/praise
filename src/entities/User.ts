import mongoose from 'mongoose';
import { mongoosePagination, Pagination } from 'mongoose-paginate-ts';

export interface UserAccountInterface {
  username: string;
  profileImageUrl: string;
  platform: string; // DISCORD | TELEGRAM
}

export interface UserInterface extends mongoose.Document {
  ethereumAddress: string;
  accounts: Array<UserAccountInterface>;
  roles: Array<string>;
  createdAt: Date;
  updatedAt: Date;
}

export const accountSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    profileImageUrl: { type: String },
    platform: {
      type: String,
      enum: ['DISCORD', 'TELEGRAM'],
      default: 'DISCORD',
    },
  },
  {
    timestamps: true,
  }
);

export enum UserRole {
  admin = 'ADMIN',
  user = 'USER',
  quantifier = 'QUANTIFIER',
}

export const userSchema = new mongoose.Schema(
  {
    ethereumAddress: { type: String, required: true },
    accounts: [accountSchema],
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
