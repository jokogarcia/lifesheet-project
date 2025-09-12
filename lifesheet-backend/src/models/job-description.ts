import mongoose, { Schema, Document } from 'mongoose';
export interface IJobDescription extends Document {
  userId: string;
  content: string;
  companyName: string;
  aiSummary?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

const jobDescriptionSchema = new Schema<IJobDescription>({
  userId: { type: String, required: true },
  content: { type: String, required: true },
  aiSummary: { type: String },
  companyName: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  deletedAt: { type: Date, default: null },
});

export default mongoose.model<IJobDescription>('JobDescription', jobDescriptionSchema);
