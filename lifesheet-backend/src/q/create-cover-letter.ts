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
  companyName: string;
}
const queue = new Queue<JobData>('create-cover-letter', {
  connection: redisConfig,
});

const worker = new Worker<JobData>(
  'create-cover-letter',
  async job => {
    if (!constants.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not set');
    }
    const { jobDescriptionId, cvId, userId, companyName } = job.data;
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
    const aiClient = new GoogleGenerativeAI(constants.GEMINI_API_KEY);
    const model = aiClient.getGenerativeModel({ model: constants.MODEL_NAME });
    const briefCv = JSON.stringify(cv.toObject());
    const companyLine = companyName ? `for ${companyName}` : '';
    const prompt = `Write a concise, professional cover letter ${companyLine} for the following job description and candidate. Keep it to ~3 short paragraphs (intro, fit, closing). Use a friendly but formal tone. Do not include any commentary or JSON—output markdown-formatted text only.\n\nJob description:\n${jobDescription.content}\n\nTailored CV (JSON):\n${briefCv}`;
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
    // highlight placeholders in markdown

    if (!cv.tailored) {
      throw new Error('CV is not tailored, cannot add cover letter');
    }
    cv.tailored.coverLetter = placeholderMarker(text);
    await cv.save();
    const tokensUsed = result.response.usageMetadata?.totalTokenCount || 0;
    return { success: true, tokensUsed };
  },
  {
    connection: redisConfig,
  }
);
export default queue;
/** wraps placeholders like [placeholder] or <placeholder> or {{placeholder}} in backticks */
function placeholderMarker(text: string) {
  return text.replace(/(\[.*?\]|\<.*?\>|\{\{.*?\}\})/g, '`$1`');
}
