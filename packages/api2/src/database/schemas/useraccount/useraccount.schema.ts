import mongoose from 'mongoose';
const { Schema } = mongoose;
const { ObjectId } = Schema.Types;

export const userAccountSchema = new Schema(
  {
    _id: {
      type: ObjectId,
      required: true,
      set: (value: string) => value.toString(),
    },
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
  },
);
