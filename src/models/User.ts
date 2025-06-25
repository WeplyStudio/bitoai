import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password?: string;
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
  password: { 
    type: String, 
    required: [true, 'Password is required.'],
    select: false 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
