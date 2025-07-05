
import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  username: string;
  password?: string;
  otp?: string;
  otpExpires?: Date;
  isVerified: boolean;
  credits: number;
  role: 'user' | 'admin';
  blocked: boolean;
  achievements: string[];
  unlockedThemes: string[];
  apiRequestCount: number;
  createdAt: Date;
  
  // Gamification fields
  level: number;
  exp: number;
  nextLevelExp: number;
  coins: number;
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
  credits: {
    type: Number,
    default: 5,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  blocked: {
    type: Boolean,
    default: false,
  },
  achievements: {
    type: [String],
    default: [],
  },
  unlockedThemes: {
    type: [String],
    default: ['minimalist'],
  },
  apiRequestCount: {
    type: Number,
    default: 0,
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  // Gamification fields
  level: {
    type: Number,
    default: 1,
  },
  exp: {
    type: Number,
    default: 0,
  },
  nextLevelExp: {
    type: Number,
    default: 50,
  },
  coins: {
    type: Number,
    default: 0,
  },
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
