import mongoose from 'mongoose';

export interface UserAccountInterface {
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

const UserAccountModel = mongoose.model<UserAccountInterface>(
  'UserAccount',
  userAccountSchema
);

export default UserAccountModel;
