import { Queue, Worker } from 'bullmq';
import { redisConfig } from '../constants';
import JobDescription from '../models/job-description';
import CV from '../models/cv.model';
import { constants } from '../constants';
import { GenerateContentResult, GoogleGenerativeAI } from '@google/generative-ai';
interface JobData {
  jobDescriptionId: string;
  cvId: string;
  userId: string;
}
const queue = new Queue<JobData>('tailor-skills', {
  connection: redisConfig,
});

const worker = new Worker<JobData>(
  'tailor-skills',
  async job => {
    if (!constants.GEMINI_API_KEY) {
      throw new Error(
        'GEMINI_API_KEY is not set. Configure constants.GEMINI_API_KEY before calling tailor-skills queue.'
      );
    }
    const { jobDescriptionId, cvId, userId } = job.data;
    const jobDescription = await JobDescription.findOne({
      _id: jobDescriptionId,
      userId,
      deletedAt: null,
    });
    if (!jobDescription) {
      throw new Error(`Job description with id ${jobDescriptionId} not found`);
    }
    const summary = jobDescription.aiSummary;
    if (!summary) {
      throw new Error(`Job description with id ${jobDescriptionId} does not have aiSummary`);
    }
    const cv = await CV.findOne({ user_id: userId, deletedAt: null, _id: cvId });
    if (!cv) {
      throw new Error(`CV with id ${cvId} not found`);
    }
    const originalSkills = JSON.stringify(cv.toObject().skills);
    const aiClient = new GoogleGenerativeAI(constants.GEMINI_API_KEY);
    const model = aiClient.getGenerativeModel({ model: constants.MODEL_NAME });
    const prompt = `Given the following job description summary and list of skills in JSON format, assign each skill item a relevance value that goes from 0 to 100. A higher value means that the item is very relevant to the job description. Keep the rest of the values unchanged and output ONLY the updated JSON, without any comments or back ticks
    Job Description (Markdown): ${summary}
    Skills (JSON): ${originalSkills}`;
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
    //clean the response to extract JSON array
    text = text.slice(text.indexOf('['), text.lastIndexOf(']') + 1);

    let reorderedSkills = JSON.parse(text);
    reorderedSkills.sort((a: any, b: any) => b.relevance - a.relevance);
    reorderedSkills = reorderedSkills.map((s: any) => {
      const { relevance, ...rest } = s;
      return rest;
    });
    cv.skills = reorderedSkills;
    await cv.save();
    const tokensUsed = result.response.usageMetadata?.totalTokenCount || 0;
    return { success: true, tokensUsed };
  },
  {
    connection: redisConfig,
  }
);
export default queue;
