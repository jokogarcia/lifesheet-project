import crypto from 'crypto';
import { TranslationModel } from '../models/translation.model';
import { GenerateContentResult, GoogleGenerativeAI } from '@google/generative-ai';
import { constants } from '../constants';
const cache: { [key: string]: { text: string; timestamp: number } } = {};

// Simple in-memory cache with 24-hour expiration
const CACHE_EXPIRATION_MS = 24 * 60 * 60 * 1000;

function clearTranslationCache(): void {
  Object.keys(cache).forEach(key => delete cache[key]);
  console.log('In-memory translation cache cleared');
}

export async function translate(text: string, targetLanguage: string): Promise<string> {
  const hash = crypto.createHash('sha256').update(text).digest('hex');
  // Check cache first
  const cached = cache[hash];
  if (cached && Date.now() - cached.timestamp < CACHE_EXPIRATION_MS) {
    return cached.text;
  }
  let td = await TranslationModel.findOne({ hash, language: targetLanguage });
  if (!td) {
    const translatedText = await translateWithApi(text, targetLanguage, 'en');
    td = new TranslationModel({ hash, language: targetLanguage, text: translatedText });
    await td.save();
  }

  cache[hash] = { text: td.text, timestamp: Date.now() };

  return td.text;
}
async function translateWithApi(
  text: string,
  targetLanguage: string,
  sourceLanguage: string = 'en'
): Promise<string> {
  if (!constants.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set.');
  }
  const aiClient = new GoogleGenerativeAI(constants.GEMINI_API_KEY);
  const model = aiClient.getGenerativeModel({ model: constants.MODEL_NAME });

  const prompt = `Translate the following text from ${sourceLanguage} to ${targetLanguage}:\n\n${text}\n\nOutput only the translated text and only one translation.`;
  let result: string;
  try {
    const r = await model.generateContent(prompt);
    result = r.response.text();
  } catch (error: any) {
    throw new Error(`AI service error: ${error.message || error}`);
  }

  return result;
}
