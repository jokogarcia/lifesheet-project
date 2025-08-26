import mongoose, { Schema, Document } from 'mongoose';
export interface PersonalInfo {
  fullName: string
  email: string
  phone?: string
  location?: string
  linkedIn?: string
  github?: string
  website?: string
  summary?: string
  profilePictureUrl?: string
  title?: string
}

export interface WorkExperience {
  id: string
  company: string
  position: string
  startDate: string
  endDate: string
  current: boolean
  description: string
  location?: string
  achievements?: string[]
}

export interface Education {
  id: string
  institution: string
  degree: string
  field: string
  startDate: string
  endDate: string
  gpa: string
  location: string
}

export interface Skill {
  id: string
  name: string
  level: string
}
export interface LanguageSkill {
  id: string
  language: string
  level: string
}

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
  user_id: mongoose.Schema.Types.ObjectId;
  personal_info: PersonalInfo
  work_experience: WorkExperience[]
  education: Education[]
  skills: Skill[]
  sections: ISection[];
  language_skills: LanguageSkill[];
  isPublic: boolean;
  customStyles?: {
    template?: string;
    primaryColor?: string;
    fontFamily?: string;
    fontSize?: string;
    [key: string]: any;
  };
  created_at: Date;
  updated_at: Date;
  // Field to store tailored content
  tailored?: {
    jobDescription_id: string;
    coverLetter?: string;
    tailoredDate: Date;
    updatedByUser: boolean;
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
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    personal_info: {
      fullName: { type: String, required: true },
      email: { type: String, required: true },
      phone: String,
      location: String,
      linkedIn: String,
      website: String,
      summary: String,
      profilePictureUrl: String,
      title: String,
      github: String
    },
    work_experience: [
      {
        // client supplies a stable id for front-end tracking
        id: String,
        company: String,
        position: String,
        startDate: String,
        endDate: String,
        current: Boolean,
        description: String,
        location: String,
        achievements: [String],
      },
    ],
    education: [
      {
        id: String,
        institution: { type: String, required: true },
        degree: { type: String, required: true },
        field: String,
        startDate: { type: String, required: true },
        endDate: String,
        gpa: String,
        location: { type: String, required: true },
      },
    ],
    skills: [
      {
        id: String,
        name: { type: String, required: true },
        level: String,
      },
    ],
    language_skills: [
      {
        id: String,
        language: { type: String, required: true },
        level: { type: String, required: true },
      },
    ],
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
      jobDescription_id: String,
      tailoredDate: Date,
      updatedByUser: Boolean,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

export default mongoose.model<ICV>('CV', cvSchema);
