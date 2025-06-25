import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  username: string;
  password?: string;
  otp?: string;
  otpExpires?: Date;
  isVerified: boolean;
  createdAt: Date;
}

const UserSchema: Schema = new Schema({
  email: { 
    type: String, 
    required: [true, 'Email is required.'], 
    unique: true, 
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address.']
  },
  username: {
    type: String,
    required: [true, 'Username is required.'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long.'],
  },
  password: { 
    type: String, 
    required: [true, 'Password is required.'],
    select: false 
  },
  otp: {
    type: String,
    select: false,
  },
  otpExpires: {
    type: Date,
    select: false,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
