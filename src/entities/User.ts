import mongoose from 'mongoose';

export interface UserAccountInterface {
  createdAt: string;
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

export const AccountSchema = new mongoose.Schema({
  createdAt: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  profileImageUrl: { type: String },
  platform: {
    type: {
      type: String,
      enum: ['DISCORD', 'TELEGRAM'],
    },
    default: ['DISCORD'],
  },
});

const userSchema = new mongoose.Schema(
  {
    ethereumAddress: { type: String, required: true, unique: true },
    accounts: [AccountSchema],
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

const UserModel = mongoose.model<UserDocument>('User', userSchema);

export default UserModel;
