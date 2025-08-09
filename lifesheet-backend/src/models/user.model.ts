import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUser extends Document {
  name: string;
  email: string;
  auth0sub: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

const userSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: false,
      default: '',
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[\w.+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        'Please add a valid email',
      ],
    },
    auth0sub: {
      type: String,
      required: [true, 'auth0sub is required'],
      unique: true,
      select: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    }
  },
  {
    timestamps: true,
  }
);




export default mongoose.model<IUser>('User', userSchema);
