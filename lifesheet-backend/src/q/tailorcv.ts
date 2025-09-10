import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';
import { redisConfig } from '../constants';

import { Consumption } from '../models/consumption.model';
import { getSecondsUntilNextWeek, getSecondsUntilTomorrow } from '../utils/utils';
import User, { IUser } from '../models/user.model';
import CV, { defaultLeftColumnSections, defaultSectionOrder } from '../models/cv.model';
import * as cvTailoringService from '../services/cv-tailoring-service';
import JobDescription from '../models/job-description';
import { checkUserCanDoOperation } from '../services/saas';
import pictureModel from '../models/picture.model';
interface TailorCVJobData {
  userId: string;
  jobDescriptionId: string;
  companyName: string;
  includeCoverLetter: boolean;
  useAiTailoring: boolean;
  pictureId?: string;
}

const tailorCVQueue = new Queue<TailorCVJobData>('tailorCV', { connection: redisConfig });

const worker = new Worker(
  'tailorCV',
  async job => {
    const { userId, jobDescriptionId, companyName, includeCoverLetter, useAiTailoring } = job.data;
    const canDo = await checkUserCanDoOperation(userId);
    if (!canDo.canOperate) {
      const retryAfter =
        canDo.reason === 'Daily limit reached'
          ? getSecondsUntilTomorrow()
          : getSecondsUntilNextWeek();
      throw new Error(
        `User cannot perform operation: ${canDo.reason}. Retry after ${retryAfter} seconds.`
      );
    }
    const userInfo = await User.findById(userId);
    if (!userInfo) {
      throw new Error(`User with id ${userId} not found`);
    }
    let mainCv = await CV.findOne({
      user_id: userId,
      deletedAt: null,
    }).sort({ created_at: 1 });
    if (!mainCv) {
      throw new Error(`Main CV not found`);
    }
    job.log(`Using CV ${mainCv._id} as main CV for tailoring`);
    const jobDescriptionDoc = await JobDescription.findOne({
      _id: jobDescriptionId,
      userId,
      deletedAt: null,
    });
    if (!jobDescriptionDoc) {
      throw new Error(`Job description with id ${jobDescriptionId} not found`);
    }
    job.log(`Using job description ${jobDescriptionDoc._id} for tailoring`);
    job.log('Begin tailoring');
    const r = await cvTailoringService.tailorCV(mainCv, jobDescriptionDoc.content, useAiTailoring);
    if (!r || !r.tailored_cv) {
      throw new Error(`Failed to tailor CV`);
    }
    job.log('Tailoring completed');
    const tailoredCv = r.tailored_cv;
    const defaultPictureId = await pictureModel.findOne({ userId, isDefault: true });
    job.log(`Using picture ${defaultPictureId?._id} as default picture for tailored CV`);
    tailoredCv.tailored = {
      jobDescription_id: jobDescriptionId,
      tailoredDate: new Date(),
      updatedByUser: false,
      coverLetterOnTop: false,
      sectionOrder: defaultSectionOrder,
      hiddenSections: [],
      leftColumnSections: [...defaultLeftColumnSections],
      pdfOptions: {
        pictureId: defaultPictureId?._id.toString() || '',
        template: 'single-column-1',
        primaryColorOverride: '#0000aa',
        secondaryColorOverride: '#00aa00',
        textColorOverride: '#000000',
        text2ColorOverride: '#aaaaaa',
        backgroundColorOverride: '#ffffff',
        includeEmail: true,
        includeAddress: true,
        includeDateOfBirth: false,
        includePhone: true,
      },
    };
    if (includeCoverLetter) {
      job.log('Generating cover letter');
      const coverLetter = await cvTailoringService.generateCoverLetter(
        r.tailored_cv,
        jobDescriptionDoc.content,
        userId,
        companyName
      );
      tailoredCv.tailored.coverLetter = coverLetter;
    } else {
      job.log('Skipping cover letter generation');
    }
    job.log('CV tailored section: ' + JSON.stringify(tailoredCv.tailored));

    const { _id: tailoredCvId } = await CV.create(tailoredCv);
    job.log(`Tailored CV created with id ${tailoredCvId}`);
    const { _id: consumptionId } = await Consumption.create({
      userId,
      jobDescriptionId,
      cvId: tailoredCvId,
      createdAt: new Date(),
      tokens: r.tokens_used,
    });
    const cvid = typeof tailoredCvId === 'string' ? tailoredCvId : tailoredCvId?.toString();
    return {
      tailoredCVId: cvid,
      consumptionId: consumptionId.toString(),
    };
  },
  { connection: redisConfig }
);

export default tailorCVQueue;
