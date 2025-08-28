// This file configures Auth for the backend API
import { auth, claimCheck } from 'express-oauth2-jwt-bearer';
import { Request, Response, NextFunction } from 'express';
import { ApiError } from './errorHandler';
import User, { IUser } from '../models/user.model';
import { getUserInfo } from '../services/auth';
import  { constants } from '../constants'

// Initialize Auth middleware
export const jwtCheck = auth({
  audience: constants.AUTH_AUDIENCE,
  issuerBaseURL: `https://${constants.AUTH_DOMAIN}/`,
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
/**
 * Middleware to extract user information from Auth token.
 * It creates a new user if a matching one does not exist
 * @param req 
 * @param res 
 * @param next 
 */
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
        const userAuthInfo = getUserInfo(req.auth.token)
        const newdoc = await User.insertOne({
          name:userAuthInfo.name,
          email:userAuthInfo.email,
          sub:sub,
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
        authProvider: 'keycloak',
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
 * Gets a user id from the database using their Auth sub.
 * Users are cached in memory for better performance
 * TODO: implement a REDIS cache
 * @param authsub:string
 * @returns the user id or undefined
 */
export const getUserIdFromSub = async (authsub: string): Promise<string | undefined> => {
  // Check if the user is already cached
  if (userSubIdCache[authsub]) {
    return userSubIdCache[authsub];
  }
  let user = await User.findOne({ sub: authsub });
  if (!user) {
    return undefined;
  } else if (user.deletedAt) {
    // If user exists but is deleted, throw an error
    throw new ApiError(403, 'User has been deleted');
  }
  userSubIdCache[authsub] = user.id;
  return user.id;

}