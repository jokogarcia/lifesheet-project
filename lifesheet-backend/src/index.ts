import dotenv from 'dotenv';
dotenv.config();

import express, { Express, Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';

import apiRouter from './routes/api';
import privateRoutes from './routes/private.routes';
import { setupBullBoard } from './bullboard';
import { errorHandler } from './middleware/errorHandler';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { PDFService } from './services/pdf-service';
import { constants } from './constants'

const app: Express = express();
setupBullBoard(app, '/private/bull');

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

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



// Connect to MongoDB
mongoose.connect(constants.MONGODB_URI as string)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

app.use('/api', apiRouter);
app.use('/private', privateRoutes);





// Proxy all non-API requests to localhost:4000
if (constants.NODE_ENV !== 'production') {
  //In production, we will use Nginx to handle the proxying
  
  app.use(createProxyMiddleware({
    target: 'http://localhost:4000',
    changeOrigin: true,
  }));
}

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
app.listen(constants.PORT, () => {
  console.log(`Server is running on port ${constants.PORT}`);
});
