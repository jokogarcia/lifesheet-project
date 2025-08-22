import mongoose, { Schema, Document } from 'mongoose';
import cron from 'node-cron';


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

const model = mongoose.model<IPictureShare>('PictureShare', PictureShareSchema);
export function deleteExpiredLinks() {
    model.deleteMany({ expiresAt: { $lt: new Date() } })
        .then(() => console.log('Expired picture share links deleted'))
        .catch(err => console.error('Error deleting expired picture share links:', err));
}

console.log('Scheduled task for deleting expired picture share links');
cron.schedule('@daily', () => {
    deleteExpiredLinks();
});
export default model;
