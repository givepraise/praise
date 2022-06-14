import { Schema, model} from 'mongoose';
import { mongoosePagination, Pagination } from 'mongoose-paginate-ts';
import { UserAccountDocument } from './types';

export const userAccountSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
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

export const UserAccountModel = model<
  UserAccountDocument,
  Pagination<UserAccountDocument>
>('UserAccount', userAccountSchema);
