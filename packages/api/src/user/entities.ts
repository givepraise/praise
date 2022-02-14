import mongoose, { Schema } from 'mongoose';
import { mongoosePagination, Pagination } from 'mongoose-paginate-ts';
import { UserDocument, UserRole } from './types';

export const userSchema = new mongoose.Schema(
  {
    ethereumAddress: { type: String, required: true, unique: true },
    accounts: [{ type: Schema.Types.ObjectId, ref: 'UserAccount' }],
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

export const UserModel = mongoose.model<UserDocument, Pagination<UserDocument>>(
  'User',
  userSchema
);
