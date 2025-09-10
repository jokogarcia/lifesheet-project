import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/user.model';
import CV from '../models/cv.model';
import { constants } from '../constants';
// Load env vars
dotenv.config();

// Connect to DB
mongoose
  .connect(constants.MONGODB_URI as string)
  .then(() => {
    console.log('MongoDB Connected...');
  })
  .catch(err => {
    console.error('MongoDB Connection Error:', err);
    process.exit(1);
  });

// Sample user data
const sampleUsers = [
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'password123',
  },
];

// Sample CV data (will be created after users)
const createSampleCV = async (userId: mongoose.Types.ObjectId) => {
  return {
    user_id: userId,
    name: 'Professional CV',
    title: 'Software Developer',
    personalInfo: {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '123-456-7890',
      address: 'San Francisco, CA',
      website: 'johndoe.dev',
      linkedin: 'linkedin.com/in/johndoe',
      github: 'github.com/johndoe',
      summary:
        'Experienced software developer with expertise in JavaScript, TypeScript, and React.',
    },
    sections: [
      {
        type: 'experience',
        title: 'Work Experience',
        items: [
          {
            title: 'Senior Software Engineer',
            subtitle: 'Tech Company Inc.',
            description: 'Developed and maintained web applications using React and Node.js.',
            startDate: new Date('2020-01-01'),
            endDate: new Date('2023-01-01'),
            location: 'San Francisco, CA',
            items: [
              'Led a team of 5 developers to deliver a major product feature',
              'Improved application performance by 40%',
              'Implemented CI/CD pipelines',
            ],
          },
          {
            title: 'Software Developer',
            subtitle: 'Startup XYZ',
            description: 'Full stack development with React, Node.js, and MongoDB.',
            startDate: new Date('2018-01-01'),
            endDate: new Date('2019-12-31'),
            location: 'San Francisco, CA',
            items: [
              'Built responsive web applications',
              'Collaborated with design and product teams',
              'Implemented RESTful APIs',
            ],
          },
        ],
      },
      {
        type: 'education',
        title: 'Education',
        items: [
          {
            title: 'M.S. Computer Science',
            subtitle: 'Stanford University',
            description: 'Focus on artificial intelligence and machine learning',
            startDate: new Date('2016-09-01'),
            endDate: new Date('2018-06-30'),
            location: 'Stanford, CA',
          },
          {
            title: 'B.S. Computer Science',
            subtitle: 'University of California, Berkeley',
            description: 'Minor in Mathematics',
            startDate: new Date('2012-09-01'),
            endDate: new Date('2016-05-30'),
            location: 'Berkeley, CA',
          },
        ],
      },
      {
        type: 'skills',
        title: 'Skills',
        items: [
          {
            title: 'Programming Languages',
            items: ['JavaScript', 'TypeScript', 'Python', 'Java', 'C++'],
          },
          {
            title: 'Frameworks & Libraries',
            items: ['React', 'Node.js', 'Express', 'Next.js', 'Django'],
          },
          {
            title: 'Tools & Platforms',
            items: ['Git', 'Docker', 'AWS', 'CI/CD', 'MongoDB', 'PostgreSQL'],
          },
        ],
      },
      {
        type: 'projects',
        title: 'Projects',
        items: [
          {
            title: 'Lifesheet CV Builder',
            description: 'A web application for creating and managing professional CVs',
            url: 'github.com/johndoe/lifesheet',
          },
          {
            title: 'Smart Home Dashboard',
            description: 'IoT dashboard for monitoring and controlling smart home devices',
            url: 'github.com/johndoe/smart-home',
          },
        ],
      },
    ],
    isPublic: false,
  };
};

// Import data function
const importData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await CV.deleteMany({});

    console.log('Data cleared...');

    // Insert users
    const createdUsers = (await User.insertMany(sampleUsers)) as mongoose.Document<{
      _id: mongoose.Types.ObjectId;
    }>[]; // Explicitly type the result
    console.log('Users created...');
    const firstUser = createdUsers[0];
    // Create sample CVs for the first user
    const sampleCV = await createSampleCV(firstUser._id as mongoose.Types.ObjectId);
    await CV.create(sampleCV);

    console.log('Sample CV created...');
    console.log('Data import completed successfully');
    process.exit();
  } catch (err) {
    console.error('Error importing data:', err);
    process.exit(1);
  }
};

// Delete data function
const deleteData = async () => {
  try {
    await User.deleteMany({});
    await CV.deleteMany({});

    console.log('Data deleted...');
    process.exit();
  } catch (err) {
    console.error('Error deleting data:', err);
    process.exit(1);
  }
};

// Check command line arguments
if (process.argv[2] === '-i') {
  importData();
} else if (process.argv[2] === '-d') {
  deleteData();
} else {
  console.log('Please provide an option: -i (import) or -d (delete)');
  process.exit();
}
