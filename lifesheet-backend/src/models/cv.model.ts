import mongoose, { Schema, Document } from 'mongoose';

// CV Section Schema (for components like Education, Experience, etc.)
interface ISection extends Document {
  type: string;
  title: string;
  items: {
    title: string;
    subtitle?: string;
    description?: string;
    startDate?: Date;
    endDate?: Date;
    current?: boolean;
    location?: string;
    url?: string;
    items?: string[];
    [key: string]: any;
  }[];
}

// CV Schema
export interface ICV extends Document {
  user: mongoose.Schema.Types.ObjectId;
  name: string;
  title?: string;
  personalInfo: {
    name: string;
    email: string;
    phone?: string;
    address?: string;
    website?: string;
    linkedin?: string;
    github?: string;
    twitter?: string;
    summary?: string;
    [key: string]: any;
  };
  sections: ISection[];
  isPublic: boolean;
  customStyles?: {
    template?: string;
    primaryColor?: string;
    fontFamily?: string;
    fontSize?: string;
    [key: string]: any;
  };
  createdAt: Date;
  updatedAt: Date;
  // Field to store tailored content
  tailored?: {
    jobDescription?: string;
    tailoredSections?: {
      sectionId: string;
      tailoredContent: any;
    }[];
    tailoredDate?: Date;
  };
}

const sectionSchema = new Schema({
  type: {
    type: String,
    required: true,
    enum: ['education', 'experience', 'skills', 'projects', 'languages', 'certifications', 'achievements', 'custom'],
  },
  title: {
    type: String,
    required: true,
  },
  items: [
    {
      title: {
        type: String,
        required: true,
      },
      subtitle: String,
      description: String,
      startDate: Date,
      endDate: Date,
      current: Boolean,
      location: String,
      url: String,
      items: [String],
      // Additional fields can be added dynamically
    },
  ],
});

const cvSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    title: String,
    personalInfo: {
      name: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
      phone: String,
      address: String,
      website: String,
      linkedin: String,
      github: String,
      twitter: String,
      summary: String,
    },
    sections: [sectionSchema],
    isPublic: {
      type: Boolean,
      default: false,
    },
    customStyles: {
      template: String,
      primaryColor: String,
      fontFamily: String,
      fontSize: String,
    },
    tailored: {
      jobDescription: String,
      tailoredSections: [
        {
          sectionId: String,
          tailoredContent: Schema.Types.Mixed,
        },
      ],
      tailoredDate: Date,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ICV>('CV', cvSchema);
