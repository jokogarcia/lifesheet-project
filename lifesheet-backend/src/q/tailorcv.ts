import { Queue, Worker, QueueEvents } from 'bullmq';
import { redisConfig } from '../constants';
import createJobSummaryQueue from './create-job-summary';
import tailorWorkExperienceQueue from './tailor-work-experience';
import tailorSkillsQueue from './tailor-skills';
import { Consumption } from '../models/consumption.model';
import { getSecondsUntilNextWeek, getSecondsUntilTomorrow } from '../utils/utils';
import User from '../models/user.model';
import CV, { defaultLeftColumnSections, defaultSectionOrder } from '../models/cv.model';
import JobDescription from '../models/job-description';
import { checkUserCanDoOperation } from '../services/saas';
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
    const _newCv = mainCv.toObject();
    delete (_newCv as any)._id;
    _newCv.created_at = new Date();
    _newCv.updated_at = new Date();
    _newCv.tailored = {
      jobDescription_id: jobDescriptionId,
      tailoredDate: new Date(),
      updatedByUser: false,
      coverLetterOnTop: false,
      sectionOrder: defaultSectionOrder,
      hiddenSections: [],
      leftColumnSections: [...defaultLeftColumnSections],
      pdfOptions: {
        pictureId: job.data.pictureId || '',
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
    const tailoredCV = await CV.create(_newCv);
    const newCvId = tailoredCV._id!.toString();
    job.log(`Created new CV ${newCvId} as copy of main CV`);
    job.updateProgress(10);

    await CreateAISummaryWithRetry(userId, jobDescriptionId);
    job.updateProgress(30);
    job.log('Job description summary ensured');
    let jobDescriptionDoc = await JobDescription.findOne({
      _id: jobDescriptionId,
      userId,
      deletedAt: null,
    });
    if (!jobDescriptionDoc) {
      throw new Error(`Job description with id ${jobDescriptionId} not found`);
    }
    console.log('Job Description Summary:', jobDescriptionDoc.aiSummary);
    const we_tokens = await TailorWorkExperienceWithRetry(userId, newCvId, jobDescriptionId);
    job.updateProgress(60);
    job.log('Work experience tailored');
    const skillsResult = await TailorSkillsWithRetry(userId, newCvId, jobDescriptionId);
    job.updateProgress(80);
    let cl_tokens = 0;
    if (includeCoverLetter) {
      job.log('Generating cover letter');
      const cl_result = await CreateCoverLetterWithRetry(job.data, newCvId);
      job.log('Cover letter generated');
      cl_tokens = cl_result.tokensUsed;
    }
    job.updateProgress(90);
    const totalTokens = we_tokens.tokensUsed + skillsResult.tokensUsed + cl_tokens;
    job.log(
      `Total tokens used: ${totalTokens} (Work Experience: ${we_tokens.tokensUsed}, Skills: ${skillsResult.tokensUsed}, Cover Letter: ${cl_tokens})`
    );

    job.log(
      `Tailored CV has ${tailoredCV.skills.length} skills and ${tailoredCV.work_experience.length} work experience entries`
    );
    const { _id: consumptionId } = await Consumption.create({
      userId,
      jobDescriptionId,
      cvId: newCvId,
      createdAt: new Date(),
      tokens: totalTokens,
    });
    const cvid = newCvId;
    return {
      tailoredCVId: cvid,
      consumptionId: consumptionId.toString(),
    };
  },
  { connection: redisConfig }
);

export default tailorCVQueue;
import CreateCoverLetterQueue from './create-cover-letter';
async function CreateCoverLetterWithRetry(
  data: TailorCVJobData,
  cvId: string,
  maxRetries: number = 5
) {
  let retryBackoff = 1000; // start with 1 second
  const { userId, jobDescriptionId, companyName } = data;
  let attempt = 0;
  const queryEvents = new QueueEvents('create-cover-letter', { connection: redisConfig });
  while (attempt < maxRetries) {
    const r = await CreateCoverLetterQueue.add('create-cover-letter', {
      userId,
      cvId,
      jobDescriptionId,
      companyName,
    });
    const result = await r.waitUntilFinished(queryEvents);
    if (!result.success && result.isRetryable) {
      console.log(
        `Cover letter generation failed: ${result.message}. Retrying in ${retryBackoff}ms...`
      );
      await new Promise(resolve => setTimeout(resolve, retryBackoff));
      retryBackoff *= 2; // Exponential backoff
      attempt++;
      continue;
    }
    if (!result.success) {
      throw new Error(`Cover letter generation failed: ${result.message}`);
    }
    return {
      tokensUsed: result.tokensUsed,
    };
  }
  throw new Error('Failed to generate cover letter after multiple attempts');
}
async function CreateAISummaryWithRetry(
  userId: string,
  jobDescriptionId: string,
  maxRetries: number = 5
) {
  let retryBackoff = 1000; // start with 1 second
  let attempt = 0;
  const queryEvents = new QueueEvents('create-job-summary', { connection: redisConfig });
  const jobDescriptionDoc = await JobDescription.findOne({
    _id: jobDescriptionId,
    userId,
    deletedAt: null,
  });
  if (!jobDescriptionDoc) {
    throw new Error(`Job description with id ${jobDescriptionId} not found`);
  }
  if (jobDescriptionDoc.aiSummary) {
    return { tokensUsed: 0 }; // No need to generate summary
  }
  while (attempt < maxRetries) {
    const r = await createJobSummaryQueue.add('createJobSummary', {
      userId,
      jobDescriptionId,
    });
    const result = await r.waitUntilFinished(queryEvents);
    if (!result.success && result.isRetryable) {
      console.log(
        `Job summary generation failed: ${result.message}. Retrying in ${retryBackoff}ms...`
      );
      await new Promise(resolve => setTimeout(resolve, retryBackoff));
      retryBackoff *= 2; // Exponential backoff
      attempt++;
      continue;
    }
    if (!result.success) {
      throw new Error(`Job summary generation failed: ${result.message}`);
    }
    jobDescriptionDoc.aiSummary = result.summary;
    await jobDescriptionDoc.save();
    return {
      tokensUsed: result.tokensUsed,
    };
  }
  throw new Error('Failed to generate job description summary after multiple attempts');
}
async function TailorSkillsWithRetry(
  userId: string,
  cvId: string,
  jobDescriptionId: string,
  maxRetries: number = 5
) {
  let retryBackoff = 1000; // start with 1 second
  let attempt = 0;
  const queryEvents = new QueueEvents('tailor-skills', { connection: redisConfig });
  while (attempt < maxRetries) {
    const r = await tailorSkillsQueue.add('tailorSkills', {
      userId,
      cvId,
      jobDescriptionId,
    });
    const result = await r.waitUntilFinished(queryEvents);
    if (!result.success && result.isRetryable) {
      console.log(`Tailor skills failed: ${result.message}. Retrying in ${retryBackoff}ms...`);
      await new Promise(resolve => setTimeout(resolve, retryBackoff));
      retryBackoff *= 2; // Exponential backoff
      attempt++;
      continue;
    }
    if (!result.success) {
      throw new Error(`Tailor skills failed: ${result.message}`);
    }
    return {
      reorderedSkills: result.reorderedSkills,
      tokensUsed: result.tokensUsed,
    };
  }
  throw new Error('Failed to tailor skills after multiple attempts');
}
async function TailorWorkExperienceWithRetry(
  userId: string,
  cvId: string,
  jobDescriptionId: string,
  maxRetries: number = 5
) {
  let retryBackoff = 1000; // start with 1 second
  let attempt = 0;
  const queryEvents = new QueueEvents('tailor-work-experience', { connection: redisConfig });
  while (attempt < maxRetries) {
    const r = await tailorWorkExperienceQueue.add('tailorWorkExperience', {
      userId,
      cvId,
      jobDescriptionId,
    });
    const result = await r.waitUntilFinished(queryEvents);
    if (!result.success && result.isRetryable) {
      console.log(
        `Tailor work experience failed: ${result.message}. Retrying in ${retryBackoff}ms...`
      );
      await new Promise(resolve => setTimeout(resolve, retryBackoff));
      retryBackoff *= 2; // Exponential backoff
      attempt++;
      continue;
    }
    if (!result.success) {
      throw new Error(`Tailor work experience failed: ${result.message}`);
    }
    return {
      tailoredWorkExperience: result.tailoredWorkExperience,
      tokensUsed: result.tokensUsed,
    };
  }
  throw new Error('Failed to tailor work experience after multiple attempts');
}
