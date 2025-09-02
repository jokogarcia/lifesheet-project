
import { Queue, Worker } from "bullmq";
import IORedis from "ioredis";
import { redisConfig } from "../constants";

import { Consumption } from "../models/consumption.model";
import { getSecondsUntilNextWeek, getSecondsUntilTomorrow } from "../utils/utils";
import User, { IUser } from '../models/user.model';
import CV from '../models/cv.model';
import * as cvTailoringService from '../services/cv-tailoring-service'
import JobDescription from "../models/job-description";
import { checkUserCanDoOperation } from "../services/saas";
interface TailorCVJobData {

    userId: string;
    jobDescriptionId: string;
    companyName: string;
    includeCoverLetter: boolean;
    useAiTailoring: boolean;
    pictureId?: string;
};

const tailorCVQueue = new Queue<TailorCVJobData>("tailorCV", { connection: redisConfig });


const worker = new Worker("tailorCV", async (job) => {
    const { userId, jobDescriptionId, companyName, includeCoverLetter, useAiTailoring } = job.data;
    const canDo = await checkUserCanDoOperation(userId);
    if (!canDo.canOperate) {
        const retryAfter = canDo.reason === "Daily limit reached" ? getSecondsUntilTomorrow() : getSecondsUntilNextWeek();
        throw new Error(`User cannot perform operation: ${canDo.reason}. Retry after ${retryAfter} seconds.`);
    }
    const userInfo = await User.findById(userId);
    if (!userInfo) {
        throw new Error(`User with id ${userId} not found`);
    }
    let mainCv = await CV.findOne({ user_id: userId, deletedAt: null, tailored: { $exists: false } });
    if (!mainCv) {
        throw new Error(`Main CV not found`);
    };
    const jobDescriptionDoc = await JobDescription
        .findOne({
            _id: jobDescriptionId,
            userId,
            deletedAt: null
        });
    if (!jobDescriptionDoc) {
        throw new Error(`Job description with id ${jobDescriptionId} not found`);
    }
    const r = await cvTailoringService.tailorCV(mainCv, jobDescriptionDoc.content, useAiTailoring);
    if (!r || !r.tailored_cv) {
        throw new Error(`Failed to tailor CV`);
    }
    const tailoredCv = r.tailored_cv;
    tailoredCv.tailored = {
        jobDescription_id: jobDescriptionId,
        tailoredDate: new Date(),
        updatedByUser: false
    };
    if (includeCoverLetter) {
        const coverLetter = await cvTailoringService.generateCoverLetter(r.tailored_cv, jobDescriptionDoc.content, userId, companyName);
        tailoredCv.tailored.coverLetter = coverLetter;
    }
    const { _id: tailoredCvId } = await CV.create(tailoredCv);
    const { _id: consumptionId } = await Consumption.create({
        userId,
        jobDescriptionId,
        cvId: tailoredCvId,
        createdAt: new Date(),
        tokens: r.tokens_used
    });
    const cvid = typeof (tailoredCvId) === 'string' ? tailoredCvId : tailoredCvId?.toString();
    return {
        tailoredCVId: cvid,
        consumptionId: consumptionId.toString()
    };
}, { connection: redisConfig });
async function patchUser() {
    //finds user with auth0sub="auth0|6859152a00fbb6fb935ab2b6"
    //and adds the sub=5449746c-e3ca-454a-bb49-8f242bfcffcf
    try {
        const r = await User.findOneAndUpdate({
            auth0sub: "auth0|6859152a00fbb6fb935ab2b6"
        }, {
            sub: "5449746c-e3ca-454a-bb49-8f242bfcffcf"
        });
        console.log("User patch result", r);
    } catch (e) {
        console.error("Error patching user", e);
    }
}
patchUser();
export default tailorCVQueue;