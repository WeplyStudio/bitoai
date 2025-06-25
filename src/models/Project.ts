import mongoose, { Schema, Document } from 'mongoose';

export interface IProject extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  name: string;
  summary: string;
  createdAt: Date;
}

const ProjectSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, default: 'Untitled Chat' },
  summary: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);