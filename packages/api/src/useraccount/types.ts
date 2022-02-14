/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from 'mongoose';

export interface UserAccount {
  _id?: any;
  id?: any; //TODO This needs a better name!
  username: string;
  profileImageUrl: string;
  platform: string; // DISCORD | TELEGRAM
  activateToken?: string;
}

export interface UserAccountDocument extends UserAccount, mongoose.Document {}
