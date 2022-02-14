import mongoose from 'mongoose';
import { mongoosePagination, Pagination } from 'mongoose-paginate-ts';
import { UserAccountDocument } from './types';

export const userAccountSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    profileImageUrl: { type: String },
    platform: {
      type: String,
      enum: ['DISCORD', 'TELEGRAM'],
      default: 'DISCORD',
    },
    activateToken: { type: String, select: false },
  },
  {
    collection: 'accounts',
    timestamps: true,
  }
);

userAccountSchema.plugin(mongoosePagination);

export const UserAccountModel = mongoose.model<
  UserAccountDocument,
  Pagination<UserAccountDocument>
>('UserAccount', userAccountSchema);
