import mongoose from 'mongoose';

export interface UserAccountDocument extends mongoose.Document {
  id: string;
  username: string;
  profileImageUrl: string;
  platform: string; // DISCORD | TELEGRAM
  activateToken?: string;
}
