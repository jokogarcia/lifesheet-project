import { Queue, Worker, QueueEvents } from 'bullmq';
import { redisConfig } from '../constants';
import CV from '../models/cv.model';
import { isValidSupportedLanguage } from '../services/translate-service';
import { constants } from '../constants';
import { GenerateContentResult, GoogleGenerativeAI } from '@google/generative-ai';
import { Types } from 'mongoose';
interface TranslateCVJobData {
  cvId: string;
  translateTo: string;
}
const translateCVQueue = new Queue<TranslateCVJobData>('translate-cv', { connection: redisConfig });

const worker = new Worker<TranslateCVJobData>(
  'translate-cv',
  async job => {
    const { cvId, translateTo } = job.data;
    if (translateTo == 'none') {
      job.log('Skipping translation');
      return {
        success: true,
        tokensUsed: 0,
      };
    }
    if (!isValidSupportedLanguage(translateTo)) {
      return {
        success: false,
        message: 'unsupported language',
        isRetryable: false,
      };
    }
    if (!constants.GEMINI_API_KEY) {
      return {
        success: false,
        message: 'GEMINI_API_KEY not set',
        isRetryable: false,
      };
    }

    // Fetch CV from DB
    const cv = await CV.findById(cvId);
    if (!cv) {
      return {
        success: false,
        message: 'CV not found',
        isRetryable: false,
      };
    }

    const prompt = `You are a professional translator. Translate the following JSON document to ${translateTo}.
  Preserve the JSON structure exactly, only translating the text values. Do not change any keys or formatting.
  Ensure the output is valid JSON.

  Here is the document to translate:
  ${JSON.stringify(cv, null, 2)}
  
  Provide only the translated JSON document as output.`;
    const aiClient = new GoogleGenerativeAI(constants.GEMINI_API_KEY);
    const model = aiClient.getGenerativeModel({ model: constants.MODEL_NAME });
    let result: GenerateContentResult;
    job.log('Initiating translation');
    job.updateProgress(10);
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
    job.updateProgress(70);
    job.log('finished translation');
    const response = result.response;
    let text = response.text();
    text = text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1); // Extract JSON substring
    let translatedCv;
    try {
      translatedCv = JSON.parse(text);
    } catch (e) {
      job.log('The received JSON was not valid:\n' + text);
      return {
        success: false,
        message: 'Translated JSON is invalid',
        isRetryable: false,
      };
    }
    job.log('Parsed translated JSON successfully');
    job.log('Saving translated CV as ' + cvId);
    const _id = new Types.ObjectId(cvId);

    try {
      const r = await CV.replaceOne({ _id }, translatedCv);
      if (r.modifiedCount == 0) {
        job.log('No documents updated');
        console.log('r', r);
      }
    } catch (e: any) {
      job.log('Error saving translated CV');
      return {
        success: false,
        message: 'Error saving translated CV',
        isRetryable: false,
      };
    }
    const tokensUsed = result.response.usageMetadata?.totalTokenCount || 0;
    console.log(`Translated CV ${cvId} to ${translateTo}, tokens used: ${tokensUsed}`);
    job.updateProgress(100);
    return {
      success: true,
      tokensUsed,
    };
  },
  { connection: redisConfig }
);
export default translateCVQueue;
