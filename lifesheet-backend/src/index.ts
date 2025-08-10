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
import { PDFService } from './services/pdf-service';

const app: Express = express();
const PORT = process.env.PORT || 3000;
// Graceful shutdown handlers
const gracefulShutdown = async (signal: string) => {
  console.log(`Received ${signal}. Starting graceful shutdown...`);

  try {
    // Close PDF service browser
    await PDFService.closeBrowser();

    // Close MongoDB connection
    await mongoose.connection.close();

    console.log('Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
};
// Proxy all non-API requests to localhost:4000
if (process.env.NODE_ENV !== 'production') {
  //In production, we will use Nginx to handle the proxying
  app.use(
    (req, res, next) => {
      // TODO: see if moving this down can avoid the need for these checks
      if (req.path.startsWith('/api') || req.path.startsWith('/uploads') || req.path.startsWith('/cv-renderer')) {
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
// TODO: let's not do this. just create an endpoint to serve images with proper authentication
app.use('/uploads', express.static(path.join(__dirname, './uploads')));

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
// Handle different shutdown signals
process.on('SIGINT', () => gracefulShutdown('SIGINT'));   // Ctrl+C
process.on('SIGTERM', () => gracefulShutdown('SIGTERM')); // Termination signal
process.on('SIGQUIT', () => gracefulShutdown('SIGQUIT')); // Quit signal

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
});
// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

