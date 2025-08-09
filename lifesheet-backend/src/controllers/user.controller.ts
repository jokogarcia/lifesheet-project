/*
User Controller
Note on user id: if the user id is 'me', it refers to the currently authenticated user.

Routes:
- GET /users/:id - Get  user profile
- PUT /users/:id - Update  user profile
- DELETE /users/:id - Delete  (mark as deleted) user profile. Only with explicit id, not 'me'.

- GET /users/:id/cv - Get user CV
- POST /users/:id/cv - Set or update user's CV
- DELETE /users/:id/cv - Delete (mark as deleted) user's CV
*/

import { Request, Response, NextFunction } from 'express';
import User, { IUser } from '../models/user.model';
import CV, { ICV } from '../models/cv.model';
import { ApiError } from '../middleware/errorHandler';
import mongoose from 'mongoose';

// Helper to resolve 'me' to the authenticated user's id
function resolveUserId(req: Request): string {
    const paramId = req.params.id;
    if (paramId === 'me') {
        if (!req.user || !req.user.id) throw new ApiError(401, 'Not authenticated');
        return req.user.id;
    }
    return paramId;
}

// GET /users/:id - Get user profile
export const getUserProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = resolveUserId(req);
        const user = await User.findById(userId).select('-auth0sub -__v');
        if (!user || user.deletedAt) throw new ApiError(404, 'User not found');
        res.json(user);
    } catch (err) {
        next(err);
    }
};

// PUT /users/:id - Update user profile
export const updateUserProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = resolveUserId(req);
        const updates = { ...req.body, updatedAt: new Date() };
        delete updates.email; // Do not allow email change
        delete updates.auth0sub;
        const user = await User.findByIdAndUpdate(userId, updates, { new: true, runValidators: true }).select('-auth0sub -__v');
        if (!user) throw new ApiError(404, 'User not found');
        res.json(user);
    } catch (err) {
        next(err);
    }
};

// DELETE /users/:id - Mark user as deleted (not allowed for 'me')
export const deleteUserProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.params.id;
        if (userId === 'me') throw new ApiError(400, "Cannot delete 'me'. Use explicit id.");
        const user = await User.findByIdAndUpdate(userId, { deletedAt: new Date() }, { new: true });
        if (!user) throw new ApiError(404, 'User not found');
        res.json({ message: 'User marked as deleted' });
    } catch (err) {
        next(err);
    }
};

// GET /users/:id/cv - Get user CV
export const getUserCV = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = resolveUserId(req);
        const userInfo = await User.findById(userId);
        if (!userInfo) {
            throw new ApiError(404, "User Not Found")
        }
        let cv = await CV.findOne({ user_id: userId, deletedAt: null, tailored: { $exists: false } });
        if (!cv) {
            const newcv = createBlankCV(userId,userInfo.email,userInfo.name || userInfo.email)
            // Create and save a blank CV if it doesn't exist
            cv = await CV.create(newcv);
        }
        res.json(cv);
    } catch (err) {
        next(err);
    }
};
function createBlankCV(userId: string, userEmail: string, userName:string) {

    return {
        user_id: userId,
        name: userName,
        personal_info: {
            fullName: userName,
            email: userEmail,

        },
        work_experience: [],
        education: [],
        skills: [],
        language_skills: [],
        isPublic: false,
        created_at: new Date(),
        updated_at: new Date()
    };
}

// GET /users/:id/cv/:cvId - Get user CV
export const getUserTailoredCV = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = resolveUserId(req);
        const cvId = req.params.cvId;
        const cv = await CV.findOne({ user_id: userId, deletedAt: null, _id: cvId, tailored: { $exists: true } });
        if (!cv) throw new ApiError(404, 'CV not found');
        res.json(cv);
    } catch (err) {
        next(err);
    }
};

export const updateUsersMainCV = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = resolveUserId(req);
        let cv = await CV.findOne({ user_id: userId, deletedAt: null, tailored: { $exists: false } });
        if (!cv) {
            throw new ApiError(404, 'CV not found');
        }
        Object.assign(cv, req.body, { updatedAt: new Date() });
        await cv.save();
        res.json(cv);

    } catch (err) {
        next(err);
    }
}
export const upsertUserTailoredCV = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = resolveUserId(req);
        if (!req.user || req.user.id !== userId) throw new ApiError(403, 'Forbidden');
        let cv = await CV.findOne({ user: userId, deletedAt: null });
        if (cv) {
            Object.assign(cv, req.body, { updatedAt: new Date() });
            await cv.save();
        } else {
            cv = await CV.create({ ...req.body, user_id: userId });
        }
        res.json(cv);
    } catch (err) {
        next(err);
    }
};

// DELETE /users/:id/cv - Mark user's CV as deleted
export const deleteUserCV = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = resolveUserId(req);
        if (!req.user || req.user.id !== userId) throw new ApiError(403, 'Forbidden');
        const cv = await CV.findOneAndUpdate(
            { user: userId, deletedAt: null },
            { deletedAt: new Date() },
            { new: true }
        );
        if (!cv) throw new ApiError(404, 'CV not found');
        res.json({ message: 'CV marked as deleted' });
    } catch (err) {
        next(err);
    }
};

export const tailorCV = async (req: Request, res: Response, next: NextFunction) => {
    //return the user's full CD for now
    console.log("Tailoring CV");
    getUserCV(req, res, next);
}
// CV.deleteMany({}).then(() => {
//     console.log("All CVs deleted");
// }).catch(err => {
//     console.error("Error deleting CVs:", err);
// });