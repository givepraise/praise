import { AuthRole } from '../../../auth/enums/auth-role.enum';
import mongoose from 'mongoose';
import { UserAccountModel } from '../useraccount/useraccount.schema';
const { Schema, model } = mongoose;
const { ObjectId } = Schema.Types;

// Add schema with old attributes to delete them
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
        enum: [AuthRole],
      },
    ],
    default: [AuthRole.USER],
  },
  createdAt: {
    type: Date,
  },
  updatedAt: {
    type: Date,
  },
  accessToken: { type: String, select: false },
  refreshToken: { type: String, select: false },
});

UserSchema.virtual('accounts', {
  ref: UserAccountModel,
  localField: '_id',
  foreignField: 'user',
});

delete mongoose.models['User'];
export const UserModel = model('User', UserSchema);
