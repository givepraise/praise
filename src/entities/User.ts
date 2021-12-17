import mongoose from "mongoose";

export interface UserInput {
  email: string;  
  password: string;
}

export interface UserDocument extends UserInput, mongoose.Document {
  createdAt: Date;
  updatedAt: Date;  
}

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },    
    password: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const UserModel = mongoose.model<UserDocument>("User", userSchema);

export default UserModel;