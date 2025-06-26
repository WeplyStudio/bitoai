
import mongoose, { Schema, Document } from 'mongoose';

const CustomAIModeSchema = new Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  prompt: { type: String, required: true },
}, { _id: false });


export interface IUser extends Document {
  email: string;
  username: string;
  password?: string;
  otp?: string;
  otpExpires?: Date;
  isVerified: boolean;
  credits: number;
  creditsSpent: number;
  messagesToday: number;
  lastMessageDate?: Date;
  role: 'user' | 'admin';
  achievements: string[];
  customAiModes: { id: string; name: string; prompt: string; }[];
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
  credits: {
    type: Number,
    default: 5,
  },
  creditsSpent: {
    type: Number,
    default: 0,
  },
  messagesToday: {
    type: Number,
    default: 0,
  },
  lastMessageDate: {
    type: Date,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  achievements: {
    type: [String],
    default: [],
  },
  customAiModes: {
    type: [CustomAIModeSchema],
    default: [],
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
