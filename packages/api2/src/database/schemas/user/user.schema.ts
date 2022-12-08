import { UserRole } from '@/users/interfaces/user-role.interface';
import mongoose from 'mongoose';
const { Schema, model } = mongoose;
const { ObjectId } = Schema.Types;

export const UserSchema = new Schema({
  _id: {
    type: ObjectId,
    required: true,
    set: (value: string) => value.toString(),
  },
  rewardsEthAddress: {
    type: String,
    required: true,
  },
  identityEthAddress: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  roles: {
    type: [
      {
        type: String,
        enum: [UserRole],
      },
    ],
    default: [UserRole.USER],
  },
  createdAt: {
    type: Date,
  },
  updatedAt: {
    type: Date,
  },
});

export const UserModel = model('User', UserSchema);
