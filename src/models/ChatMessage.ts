import mongoose, { Schema, Document } from 'mongoose';

export interface IChatMessage extends Document {
  projectId: mongoose.Schema.Types.ObjectId;
  userId: mongoose.Schema.Types.ObjectId;
  role: 'user' | 'model';
  content: string;
  imageUrl?: string;
  createdAt: Date;
  expEarned?: number;
  coinsEarned?: number;
}

const ChatMessageSchema: Schema = new Schema({
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['user', 'model'], required: true },
  content: { type: String, required: true },
  imageUrl: { type: String },
  createdAt: { type: Date, default: Date.now },
  expEarned: { type: Number, default: 0 },
  coinsEarned: { type: Number, default: 0 },
});

// Index to efficiently query messages by project
ChatMessageSchema.index({ projectId: 1, createdAt: 1 });

export default mongoose.models.ChatMessage || mongoose.model<IChatMessage>('ChatMessage', ChatMessageSchema);
