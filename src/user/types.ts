import mongoose from 'mongoose';
import { UserAccountDocument } from 'src/useraccount/types';

export interface UserDocument extends mongoose.Document {
  ethereumAddress: string;
  accounts: UserAccountDocument[];
  roles: string[];
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
  QUANTIFIER = 'QUANTIFIER',
}

export interface RoleChangeRequest {
  role: UserRole;
}
