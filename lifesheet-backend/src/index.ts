import dotenv from 'dotenv';
dotenv.config();

import express, { Express } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';

import authRoutes from './routes/auth.routes';
import cvRoutes from './routes/cv.routes';
import { errorHandler } from './middleware/errorHandler';
import { jwtCheck, extractUserFromToken } from './middleware/auth0.middleware';

const app: Express = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI as string)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

// Auth0 routes - these don't need JWT validation
app.use('/api/auth', authRoutes);

// Protected routes - require valid JWT
app.use('/api/cvs', jwtCheck, extractUserFromToken, cvRoutes);

// Auth0 validation test route
app.get('/api/auth/validate', jwtCheck, extractUserFromToken, (req, res) => {
  res.json({ 
    message: 'Your access token was successfully validated!',
    user: req.user
  });
});

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
