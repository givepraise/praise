import mongoose from 'mongoose';
const { Schema, model } = mongoose;

export enum DiscordLinkState {
  NOT_SET = 'NOT_SET',
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  DEACTIVE = 'DEACTIVE',
}

export const CommunitySchema = new Schema({
  hostname: {
    type: String,
    required: true,
    minlength: 6,
    maxlength: 64,
  },
  name: {
    type: String,
    required: true,
    minlength: 4,
    maxlength: 20,
    unique: true,
  },
  email: { type: String, required: false, minlength: 8, maxlength: 256 },
  creator: { type: String, required: true, length: 42 },
  owners: {
    type: [String],
    required: true,
    length: 42,
  },
  isPublic: { type: Boolean, default: true },
  discordGuildId: { type: String, required: false, maxlength: 32 },
  discordLinkNonce: { type: String, length: 10 },
  discordLinkState: {
    type: String,
    enum: Object.values(DiscordLinkState),
  },
  twitterBot: {
    required: false,
    type: String,
  },
});

delete mongoose.models['Community'];
export const CommunityModel = model('Community', CommunitySchema);
