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
import fs from 'fs';

import { PDFService } from '../services/pdf-service';
import path from 'path';
import Picture, { IPicture } from '../models/picture.model';

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
        const updates = { ...req.body, updatedAt: new Date() } as any;
        delete updates.email;
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
            const newcv = createBlankCV(userId, userInfo.email, userInfo.name || userInfo.email)
            // Create and save a blank CV if it doesn't exist
            cv = await CV.create(newcv);
        }
        res.json(cv);
    } catch (err) {
        next(err);
    }
};
function createBlankCV(userId: string, userEmail: string, userName: string) {

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

export const updateUsersMainCV = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = resolveUserId(req);
        const payload = req.body as ICV;
        const result = await CV.findOneAndUpdate(
            { user_id: userId, deletedAt: null, tailored: { $exists: false } },
            { $set: payload, $currentDate: { updated_at: true } },
            { new: true, runValidators: true }
        );

        res.json(result);
    } catch (err) {
        next(err);
    }
}
export const upsertUserTailoredCV = async (req: Request, res: Response, next: NextFunction):Promise<void> => {
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
    //runs the agent to tailor the CV and returns the tailored CV ID. 
    // for now, it just returns the main CV's ID
    try {
        const userId = resolveUserId(req);
        const jobDescription = req.body.jobDescription || "";
        const pictureId = req.body.pictureId || "";
        if (!jobDescription) {
            throw new ApiError(400, 'Job description is required');
        }
        const userInfo = await User.findById(userId);
        if (!userInfo) {
            throw new ApiError(404, "User Not Found")
        }
        let cv = await CV.findOne({ user_id: userId, deletedAt: null, tailored: { $exists: false } });
        if (!cv) throw new ApiError(404, 'CV not found');


        res.json({
            cvId: cv._id,
        });
    } catch (err) {
        next(err);
    }
}

export const renderCVAsPDF = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = resolveUserId(req);
        const cvId = req.params.cvId;
        const pictureId=req.query.pictureId as string;

        const pdfBuffer = await PDFService.cvToPDF(cvId, pictureId);
        res.setHeader('Content-Type', 'application/pdf');
        res.send(pdfBuffer);
    } catch (err) {
        next(err);
    }
}

export const uploadPicture = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = resolveUserId(req);
        //get the file from the request
        if (!req.file) {
            throw new ApiError(400, 'No file uploaded');
        }
        // enforce file type
        if (!req.file.mimetype.startsWith('image/')) {
            throw new ApiError(400, 'File must be an image');
        }
        // enforce file size
        if (req.file.size > 5 * 1024 * 1024) { // 5MB limit
            throw new ApiError(400, 'File size exceeds 5MB');
        }
        // save file to local drive
        const filePath = `uploads/${userId}/profile-picture-${Date.now()}.${req.file.originalname.split('.').pop()}`;
        await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
        await fs.promises.writeFile(filePath, req.file.buffer);
        // save file info to database
        const p = await Picture.create({
            user_id: userId,
            contentType: req.file.mimetype,
            filepath: filePath,
        });
        res.json({ pictureId: p.id })
    } catch (err) {
        next(err);
    }
};
export const getUserPictures = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = resolveUserId(req);
        const pictures = await Picture.find({ user_id: userId, deletedAt: null }).select('_id');
        const pictureIds = pictures.map(picture => picture._id).map((id: any) => id.toString());

        res.json({ pictureIds });
    } catch (err) {
        next(err);
    }
};
export const getUserPicture = async (req:
    Request, res: Response, next: NextFunction) => {
    try {
        const userId = resolveUserId(req);
        const pictureId = req.params.pictureId;
        const picture = await Picture.findOne({ user_id: userId, _id: pictureId, deletedAt: null });
        if (!picture) throw new ApiError(404, 'Picture not found');
        const buffer = await fs.promises.readFile(picture.filepath);
        res.setHeader('Content-Type', picture.contentType);
        res.send(buffer);
    } catch (err) {
        next(err);
    }
};
export const deleteUserPicture = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = resolveUserId(req);
        const pictureId = req.params.pictureId;
        const picture = await Picture.findOneAndUpdate(
            { user_id: userId, _id: pictureId, deletedAt: null },
            { deletedAt: new Date() },
            { new: true }
        );
        if (!picture) throw new ApiError(404, 'Picture not found');
        await fs.promises.unlink(picture.filepath);
        res.status(204).send(); // No content
    } catch (err) {
        next(err);
    }
};
// CV.deleteMany({}).then(() => {
//     console.log("All CVs deleted");
// }).catch(err => {
//     console.error("Error deleting CVs:", err);
// });