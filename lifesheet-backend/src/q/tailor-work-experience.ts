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
const queue = new Queue<JobData>('tailor-work-experience', {
  connection: redisConfig,
});

const worker = new Worker<JobData>(
  'tailor-work-experience',
  async job => {
    if (!constants.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not set.');
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
    const originalWorkExperience = JSON.stringify(cv.toObject().work_experience);
    const aiClient = new GoogleGenerativeAI(constants.GEMINI_API_KEY);
    const model = aiClient.getGenerativeModel({ model: constants.MODEL_NAME });
    const prompt = `You are an expert resume writer. Given the following job description summary and a list of work experience entries (in JSON), rewrite the descriptions and key achievements to better align with the job description. Keep the same JSON structure and field names. Focus on relevance, clarity, and impact. Do not add or remove entries, just tailor the content.
    
    Job Description Summary:${summary}

    Work Experience (JSON):${originalWorkExperience}

    IMPORTANT: Output ONLY valid JSON. Do not include backticks or any commentary!!`;
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
    let tailoredWorkExperience = JSON.parse(text);
    cv.work_experience = tailoredWorkExperience;
    await cv.save();

    const tokensUsed = result.response.usageMetadata?.totalTokenCount || 0;
    return { success: true, tokensUsed };
  },
  {
    connection: redisConfig,
  }
);
export default queue;
