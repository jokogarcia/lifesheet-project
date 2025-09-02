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
import JobDescription, { IJobDescription } from '../models/job-description';
import { ApiError } from '../middleware/errorHandler';
import fs from 'fs';
import { PDFService } from '../services/pdf-service';
import { constants } from '../constants';
import Picture, { IPicture } from '../models/picture.model';
import PictureShare, { IPictureShare } from '../models/picture-share.model'
import { Consumption } from '../models/consumption.model';
import { SaaSPlan, SaaSSubscription } from '../models/saaS-plan.model';
import { getSecondsUntilNextWeek, getSecondsUntilTomorrow } from '../utils/utils';
import path from 'path';
import { checkUserCanDoOperation, getUsersConsumptions } from '../services/saas';
import TailorCVQueue from '../q/tailorcv';
import { JobState } from 'bullmq';
import stripe from 'stripe';

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
        const user = await User.findById(userId).select('-sub -__v');
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
        delete updates.sub;
        const user = await User.findByIdAndUpdate(userId, updates, { new: true, runValidators: true }).select('-sub -__v');
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
export const getUsersTailoredCvs = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = resolveUserId(req);
        const userInfo = await User.findById(userId);
        if (!userInfo) {
            throw new ApiError(404, "User Not Found")
        }
        let cvs = await CV.find({ user_id: userId, deletedAt: null, tailored: { $exists: true } }).populate('tailored.jobDescription_id');
        const response = cvs.map(cv => {
            // Safely handle populated document or string ID
            let jobDescription: any = cv.tailored!.jobDescription_id;
            const companyName = jobDescription.companyName as string || 'Unknown Company';
            return {
                _id: cv._id,
                updatedAt: cv.updated_at,
                hasCoverLetter: !!(cv.tailored!.coverLetter),
                companyName
            };
        });
        res.json(response);
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
        const cv = await CV.findOne({ user_id: userId, deletedAt: null, _id: cvId, tailored: { $exists: true } }).populate('tailored.jobDescription_id');
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
export const upsertUserTailoredCV = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
/**
 * Begins the operation of tailoring a CV and/or generating a cover letter
 * It returns a job ID for tracking the progress of the operation.
 * @param req 
 * @param res 
 * @param next 
 */
export const tailorCV = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const userId = resolveUserId(req);
        const companyName = req.body.companyName || "";
        if (!companyName) {
            throw new ApiError(400, 'Company name is required.');
        }
        const includeCoverLetter = !!req.body.includeCoverLetter;
        const useAiTailoring = !!req.body.useAiTailoring

        let jobDescription = req.body.jobDescription || "";
        let jobDescriptionId = req.body.jobDescriptionId || "";

        const pictureId = req.body.pictureId || "";
        if (!jobDescription && !jobDescriptionId) {
            throw new ApiError(400, 'Job description is required. Provide one or a valid job description ID.');
        }
        if (!jobDescription) {
            const jobDescriptionDoc = await JobDescription
                .findOne({
                    _id: jobDescriptionId,
                    userId,
                    deletedAt: null
                });
            if (!jobDescriptionDoc) {
                throw new ApiError(404, 'Job description not found');
            }

            jobDescription = jobDescriptionDoc.content;

        } else {
            //No jobDescriptionId, but jobDescription is provided
            const r = await JobDescription.create({ content: jobDescription, userId, companyName });
            jobDescriptionId = r._id;
            console.log("Created job description for", userId, companyName);
        }
        const j = await TailorCVQueue.add(
            `${jobDescriptionId}-${Date.now()}`,
            {
                userId,
                jobDescriptionId,
                companyName,
                includeCoverLetter,
                useAiTailoring,
                pictureId
            }
        );

        res.json({
            bullId: j.id
        });
    } catch (err) {
        next(err);
    }
}

export const checkTailoringStatus = async (req: Request, res: Response, next: NextFunction) => {
    const bullId = req.params.bullId;
    try {
        const job = await TailorCVQueue.getJob(bullId);
        if (!job) {
            throw new ApiError(404, 'Job not found');
        }
        const state = await job.getState();
        const isComplete = await job.isCompleted();
        if (isComplete) {
            res.json({
                state: state,
                progress: job.progress,
                result: job.returnvalue
            });
        } else {
            res.json({
                state: state,
                progress: job.progress
            });
        }
    } catch (err) {
        next(err);
    }
};

export const renderCVAsPDF = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = resolveUserId(req);
        const cvId = req.params.cvId;
        const options = {
            pictureId: req.query.pictureId as string | undefined,
            template: req.query.template as string | undefined,
            primaryColorOverride: req.query.primaryColor as string | undefined,
            secondaryColorOverride: req.query.secondaryColor as string | undefined,
            textColorOverride: req.query.textColor as string | undefined,
            text2ColorOverride: req.query.text2Color as string | undefined,
            backgroundColorOverride: req.query.backgroundColor as string | undefined
        }


        const pdfBuffer = await PDFService.cvToPDF(cvId, options);
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
export const getUserPictureShareLink = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = resolveUserId(req);
        const pictureId = req.params.pictureId;
        const picture = await Picture.findOne({ user_id: userId, _id: pictureId, deletedAt: null });
        if (!picture) throw new ApiError(404, 'Picture not found');
        const shareLink = await PictureShare.create({
            userId,
            pictureId: picture._id,
            expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
        });
        const url = `${constants.API_URL}/api/utils/picture-link/${shareLink._id}`;
        res.json({ shareLink: url });
    } catch (err) {
        next(err);
    }
}
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

async function _getUsersActiveSubscription(userId: string) {
    const now = new Date();
    const subscriptions = await SaaSSubscription.find({
        userId,
        startDate: { $lt: now },
        endDate: { $gt: now },
        status: 'active'
    })
    if (subscriptions.length === 0) {
        //Assign free plan
        const freePlan = await SaaSPlan.findOne({ name: "Free Plan" });
        if (!freePlan) {
            throw new ApiError(500, 'Free plan not found');
        }
        const newSubscription = new SaaSSubscription({
            userId,
            planId: freePlan._id,
            startDate: new Date(),
            endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
            status: 'active'
        });
        await newSubscription.save();
        return newSubscription;
    } else if (subscriptions.length > 1) {
        // Use the most recent
        const mostRecent = subscriptions.reduce((prev, curr) => {
            return (prev.startDate > curr.startDate) ? prev : curr;
        });
        return mostRecent;
    }
    return subscriptions[0];
}
export const getUsersActiveSubscription = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = resolveUserId(req);
        const now = new Date();
        const { usersConsumptions, todaysConsumptions, thisWeeksConsumptions } = await getUsersConsumptions(userId);
        const activeSubscription = await _getUsersActiveSubscription(userId);
        const activePlan = await SaaSPlan.findById(activeSubscription.planId);
        if (!activePlan) {
            console.error("Invalid state. Active plan not found.");
            res.status(500).json({ message: "Active plan not found" });
            return;
        }
        res.json({
            activeSubscription,
            todaysConsumptions,
            thisWeeksConsumptions,
            dailyRateLimit: activePlan.dailyRateLimit,
            weeklyRateLimit: activePlan.weeklyRateLimit
        });

    } catch (err) {
        next(err);
    }
};
/** Returns all plans, regardless of status */
export const getAllUsersSubscriptions = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = resolveUserId(req);
        const subscriptions = await SaaSSubscription.find({ userId }).populate('planId');
        res.json(subscriptions);
    } catch (err) {
        next(err);
    }
};
export const getUsersSubscriptionStatus = async (req: Request, res: Response, next: NextFunction) => {
    const userId = resolveUserId(req);
    const subscriptionId = req.params.subscriptionId;
    if (!subscriptionId || typeof subscriptionId !== "string") {
        res.status(400).json({ message: "Subscription ID is required" });
        return;
    }
    const subscription = await SaaSSubscription.findOne({ userId, _id: subscriptionId })
    if (!subscription) {
        res.status(404).json({ message: "Subscription not found" });
        return;
    }
    res.json({ status: subscription?.status });
}

export const initiatePlanPurchase = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = resolveUserId(req);

        const {
            provider,
            planId,
            successUrl,
            cancelUrl
        } = req.body as { provider: 'paypal' | 'stripe', planId: string, successUrl: string, cancelUrl: string };
        const plan = await SaaSPlan.findById(planId);
        if (!plan) {
            throw new ApiError(400, 'Invalid plan ID');
        }
        const s = await SaaSSubscription.create({
            userId,
            planId,
            // These dates are placeholders, actual dates
            // will be set when payment is processed
            startDate: new Date(),
            endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
            status: 'payment-pending'
        });
        if (provider === 'paypal') {
            throw new ApiError(501, 'PayPal integration not implemented yet');
        }
        if (provider === 'stripe') {
            const stripeClient = new stripe(constants.STRIPE_SK)
            const session = await stripeClient.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [
                    {
                        price_data: {
                            currency: plan.currency,
                            product_data: {
                                name: plan.name,
                                description: plan.description,
                                images: [`${process.env.FRONTEND_URL}/images/${plan.iconUrl}`]
                            },
                            unit_amount: Math.floor(plan.priceCents)
                        },
                        quantity: 1
                    }
                ],
                mode: 'payment',
                success_url: successUrl,
                cancel_url: cancelUrl,
                metadata: {
                    userId: userId,
                    subscriptionId: s._id.toString(),
                    planId: plan._id.toString()
                }
            });
            console.log("Created Stripe session:", JSON.stringify(session));
            const startTimestamp = s.startDate.getTime();
            const endTimestamp = startTimestamp + (plan.days * 24 * 60 * 60 * 1000);
            s.endDate = new Date(endTimestamp);
            s.status = 'active';
            s.save().catch(err => {
                console.error("Error saving subscription:", err);
            });
            // Return the session ID to the client
            res.json({ sessionId: session.id, subscriptionId: s._id.toString() });
            return;
        }

        {
            //TODO: Initiate payment process with the selected provider
            // Getting price and currency from plan
            //This is just a dummy placeholder. Remove the setTimeout
            setTimeout(() => {
                s.startDate = new Date();
                // Convert startDate to timestamp, add milliseconds, then create a new Date
                const startTimestamp = s.startDate.getTime();
                const endTimestamp = startTimestamp + (plan.days * 24 * 60 * 60 * 1000);
                s.endDate = new Date(endTimestamp);
                s.status = 'active';
                s.save().catch(err => {
                    console.error("Error saving subscription:", err);
                });
            }, 5000);
        }
        // Proceed with the plan purchase
        res.json({
            message: "Plan purchase initiated",
            subscriptionId: s._id
        });
    } catch (err) {
        next(err);
    }
};

// CV.deleteMany({}).then(() => {
//     console.log("All CVs deleted");
// }).catch(err => {
//     console.error("Error deleting CVs:", err);
// });