import mongoose from 'mongoose';
import { mongoosePagination, Pagination } from 'mongoose-paginate-ts';
import { UserAccountDocument } from 'types/dist/useraccount';

export const userAccountSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    accountId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    avatarId: { type: String },
    platform: {
      type: String,
      enum: ['DISCORD', 'TELEGRAM'],
      required: true,
    },
    activateToken: { type: String, select: false },
  },
  {
    timestamps: true,
  }
);

userAccountSchema.plugin(mongoosePagination);

export const UserAccountModel = mongoose.model<
  UserAccountDocument,
  Pagination<UserAccountDocument>
>('UserAccount', userAccountSchema);
