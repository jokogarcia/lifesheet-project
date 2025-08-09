import dotenv from 'dotenv';
dotenv.config();

import express, { Express } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';

import userRoutes from './routes/user.routes';
import { errorHandler } from './middleware/errorHandler';
import { jwtCheck, extractUserFromToken } from './middleware/auth0.middleware';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app: Express = express();
const PORT = process.env.PORT || 3000;
// Proxy all non-API requests to localhost:4000
if (process.env.NODE_ENV !== 'production') {
  //In production, we will use Nginx to handle the proxying
  app.use(
    (req, res, next) => {
      if (req.path.startsWith('/api')) {
        return next();
      }
      return createProxyMiddleware({
        target: 'http://localhost:4000',
        changeOrigin: true,
      })(req, res, next);
    }
  );
}
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
app.use('/api/user', userRoutes);


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
