// This file configures Auth0 for the backend API
import { auth, claimCheck } from 'express-oauth2-jwt-bearer';
import { Request, Response, NextFunction } from 'express';
import { ApiError } from './errorHandler';
import User, { IUser } from '../models/user.model';
import { getUserInfo as getUserAuth0Info } from '../services/auth0';
import  { constants } from '../constants'

// Initialize Auth0 middleware
export const jwtCheck = auth({
  audience: constants.AUTH0_AUDIENCE,
  issuerBaseURL: `https://${constants.AUTH0_DOMAIN}/`,
  tokenSigningAlg: 'RS256'
});
declare global {
  namespace Express {
    interface Request {
      user?: {
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
      const { sub } = req.auth.payload as {
        sub?: string;
      };
      if (!sub) {
        throw new ApiError(401, 'Unauthorized: No sub claim in token');
      }
      let userId = await getUserIdFromSub(sub);
      if(!userId){
        //First login. must create a profile
        const userAuth0Info = await getUserAuth0Info(req.auth.token)
        const newdoc = await User.insertOne({
          name:'',
          email:userAuth0Info.email,
          auth0sub:sub,
          createdAt:new Date(),
          updatedAt:new Date()

        })
        
        userId = await getUserIdFromSub(sub);
        if(!userId){
          throw new Error("Cannot find the userId after creating a new profile")
        }
      }
      // Add user info to request object
      req.user = {
        authProvider: 'auth0',
        sub: sub,
        id: userId
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
export const getUserIdFromSub = async (auth0sub: string): Promise<string | undefined> => {
  // Check if the user is already cached
  if (userSubIdCache[auth0sub]) {
    return userSubIdCache[auth0sub];
  }
  let user = await User.findOne({ auth0sub });
  if (!user) {
    return undefined;
  } else if (user.deletedAt) {
    // If user exists but is deleted, throw an error
    throw new ApiError(403, 'User has been deleted');
  }
  userSubIdCache[auth0sub] = user.id;
  return user.id;

}