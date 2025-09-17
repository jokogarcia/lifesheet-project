import mongoose, { Schema, Document } from 'mongoose';
export interface Translation extends Document {
  hash: string;
  text: string;
  language: string;
}

const translationSchema: Schema = new Schema({
  hash: { type: String, required: true, index: true },
  text: { type: String, required: true },
  language: { type: String, required: true, index: true },
});

export const TranslationModel = mongoose.model<Translation>('Translation', translationSchema);
