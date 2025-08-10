import mongoose ,{ Schema, Document } from 'mongoose';

export interface IPicture extends Document {
  user_id: mongoose.Schema.Types.ObjectId;
  filepath: string;
  contentType: string;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
const pictureSchema: Schema = new Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    filepath: {
      type: String,
      required: true,
      trim: true,
    },
    contentType: {
      type: String,
      required: true,
      trim: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IPicture>('Picture', pictureSchema);
