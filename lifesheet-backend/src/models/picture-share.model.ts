import mongoose, { Schema, Document } from 'mongoose';

export interface IPictureShare extends Document {
    userId: mongoose.Types.ObjectId;
    pictureId: mongoose.Types.ObjectId;
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

const PictureShareSchema: Schema = new Schema({
    userId: { type: mongoose.Types.ObjectId, required: true, ref: 'User' },
    pictureId: { type: mongoose.Types.ObjectId, required: true, ref: 'Picture' },
    expiresAt: { type: Date, required: true, default: new Date(Date.now() + 60 * 60 * 1000) }, // 1 hour
}, { timestamps: true });

export default mongoose.model<IPictureShare>('PictureShare', PictureShareSchema);
