import mongoose, { Schema, Document } from 'mongoose';

export interface ICommunityMessage extends Document {
  content: string;
  author: string;
  createdAt: Date;
}

const CommunityMessageSchema: Schema = new Schema({
  content: { type: String, required: true },
  author: { type: String, required: true, default: 'Anonymous' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.CommunityMessage || mongoose.model<ICommunityMessage>('CommunityMessage', CommunityMessageSchema);
