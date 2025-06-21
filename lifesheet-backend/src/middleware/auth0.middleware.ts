// This file configures Auth0 for the backend API
import { auth, claimCheck } from 'express-oauth2-jwt-bearer';
import { Request, Response, NextFunction } from 'express';
import { ApiError } from './errorHandler';
import User, { IUser } from '../models/user.model';

// Initialize Auth0 middleware
export const jwtCheck = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}/`,
  tokenSigningAlg: 'RS256'
});
declare global {
  namespace Express {
    interface Request {
      user?: {
        email: string;
        name: string;
        id: string;
        authProvider?: string;
        sub?: string;
      };
    }
  }
}
// Extract user info from Auth0 token
export const extractUserFromToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.auth && req.auth.payload) {
      // Extract user info from token claims
      const { sub, email, name } = req.auth.payload as {
        sub?: string;
        email?: string;
        name?: string;
      };
      if (!sub) {
        throw new ApiError(401, 'Unauthorized: No sub claim in token');
      }
      // Add user info to request object
      req.user = {
        email: email || '',
        name: name || '',
        authProvider: 'auth0',
        sub: sub,
        id: await getUserIdFromSub(sub, name || '', email || '')
      }
    }
    next();
  } catch (error) {
    next(error);
  }
};

// Middleware to check if user has required permissions
export const requirePermissions = (permissions: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // In a real app, you would check permissions from token or user record
      next();
    } catch (error) {
      next(new ApiError(403, 'Insufficient permissions'));
    }
  };
};


const userSubIdCache: { [key: string]: string } = {};
/**
 * Gets a user id from the database using their Auth0 sub.
 * If the user does not exist, it creates a new user with the provided sub.
 * If the user exists, but is deleted, it throws an error.
 * @param auth0sub 
 */
export const getUserIdFromSub = async (auth0sub: string, auth0Name: string, auth0Email: string): Promise<string> => {
  // Check if the user is already cached
  if (userSubIdCache[auth0sub]) {
    return userSubIdCache[auth0sub];
  }
  let user = await User.findOne({ auth0sub });
  if (!user) {
    // If user does not exist, create a new one
    user = await User.create({ auth0sub, name: auth0Name, email: auth0Email });
  } else if (user.deletedAt) {
    // If user exists but is deleted, throw an error
    throw new ApiError(403, 'User has been deleted');
  }
  userSubIdCache[auth0sub] = user.id;
  return user.id;

}