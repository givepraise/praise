import mongoose from 'mongoose';
import { mongoosePagination, Pagination } from 'mongoose-paginate-ts';

export interface UserAccountInterface extends mongoose.Document {
  id: string;
  username: string;
  profileImageUrl: string;
  platform: string; // DISCORD | TELEGRAM
}

export const userAccountSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    username: { type: String, required: true },
    profileImageUrl: { type: String },
    platform: {
      type: String,
      enum: ['DISCORD', 'TELEGRAM'],
      default: 'DISCORD',
    },
  },
  {
    collection: 'accounts',
    timestamps: true,
  }
);

userAccountSchema.plugin(mongoosePagination);

const UserAccountModel = mongoose.model<
  UserAccountInterface,
  Pagination<UserAccountInterface>
>('UserAccount', userAccountSchema);

export default UserAccountModel;
