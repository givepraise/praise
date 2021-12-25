import mongoose from 'mongoose';

export interface UserAccountInterface {
  username: string;
  profileImageUrl: string;
  platform: string; // DISCORD | TELEGRAM
}

export interface UserInterface {
  ethereumAddress: string;
  accounts: Array<UserAccountInterface>;
  roles: Array<string>;
}

export interface UserDocument extends UserInterface, mongoose.Document {
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

export const userSchema = new mongoose.Schema(
  {
    ethereumAddress: { type: String, required: true },
    accounts: [accountSchema],
    roles: {
      type: [
        {
          type: String,
          enum: ['ADMIN', 'USER', 'QUANTIFIER'],
        },
      ],
      default: ['USER'],
    },
  },
  {
    timestamps: true,
  }
);

const UserModel = mongoose.model<UserInterface>('User', userSchema);

export default UserModel;
