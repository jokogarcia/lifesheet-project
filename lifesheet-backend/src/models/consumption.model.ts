import mongoose, { Schema, Document } from 'mongoose';

export interface IConsumption {
    userId: string;
    jobDescriptionId: string;
    cvId: string;
    isCredit:boolean;
    createdAt: Date;
    tokens: number;
}
const consumptionSchema = new Schema<IConsumption>({
    userId: { type: String, required: true },
    jobDescriptionId: { type: String, required: true },
    cvId: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    tokens: { type: Number, required: true },
    isCredit: { type: Boolean, default: false }
});

export const Consumption = mongoose.model<IConsumption>('Consumption', consumptionSchema);