import { Schema, model } from 'mongoose';
import { mongoosePagination, Pagination } from 'mongoose-paginate-ts';
import { UserDocument, UserRole } from './types';

const userSchema = new Schema(
  {
    identityEthAddress: { type: String, required: true },
    rewardsEthAddress: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    roles: {
      type: [
        {
          type: String,
          enum: [UserRole],
        },
      ],
      default: [UserRole.USER],
    },
    nonce: { type: String, select: false },
    accessToken: { type: String, select: false },
    refreshToken: { type: String, select: false },
  },
  {
    timestamps: true,
  }
);

userSchema.plugin(mongoosePagination);

export const UserModel = model<UserDocument, Pagination<UserDocument>>(
  'User',
  userSchema
);
