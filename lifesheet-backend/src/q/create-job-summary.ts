import { Queue, Worker } from 'bullmq';
import { redisConfig } from '../constants';
import JobDescription from '../models/job-description';
import CV from '../models/cv.model';
import { constants } from '../constants';
import { GenerateContentResult, GoogleGenerativeAI } from '@google/generative-ai';
interface JobData {
  jobDescriptionId: string;
  userId: string;
}
const queue = new Queue<JobData>('create-job-summary', {
  connection: redisConfig,
});

const worker = new Worker<JobData>(
  'create-job-summary',
  async job => {
    if (!constants.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not set.');
    }
    const { jobDescriptionId, userId } = job.data;
    const jobDescription = await JobDescription.findOne({
      _id: jobDescriptionId,
      userId,
      deletedAt: null,
    });
    if (!jobDescription) {
      throw new Error(`Job description with id ${jobDescriptionId} not found`);
    }

    const aiClient = new GoogleGenerativeAI(constants.GEMINI_API_KEY);
    const model = aiClient.getGenerativeModel({ model: constants.MODEL_NAME });
    const prompt = `Extract a summary of the following Job Description (in markdown) as bullet points. Focus on key responsibilities and required skills. The output should be a Markdown text with the following structure:

  #Key Responsibilities 
  {list of responsibilities}
  #Required Skills
  {list of skills}
 
  #\n\nHere is the Job Description (Markdown):\n${jobDescription.content}`;
    let result: GenerateContentResult;
    try {
      result = await model.generateContent(prompt);
    } catch (error: any) {
      const isRetryable =
        error.status === 429 || // Rate limit exceeded
        error.status === 500 || // Internal server error
        error.status === 503 || // Service unavailable
        error.message?.includes('RESOURCE_EXHAUSTED') ||
        error.message?.includes('UNAVAILABLE');
      return {
        isRetryable,
        success: false,
        message: `AI service error: ${error.message || error}`,
      };
    }

    const response = result.response;
    let text = response.text();
    jobDescription.aiSummary = text;
    await jobDescription.save();

    const tokensUsed = result.response.usageMetadata?.totalTokenCount || 0;
    return { success: true, tokensUsed };
  },
  {
    connection: redisConfig,
  }
);
export default queue;
