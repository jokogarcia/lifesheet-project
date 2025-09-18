export const constants = {
  PORT: process.env.PORT || 3000,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/myapp',
  AUTH_DOMAIN: process.env.AUTH_DOMAIN || 'throw',
  AUTH_AUDIENCE: process.env.AUTH_AUDIENCE || 'throw',
  AUTH_REALM: process.env.AUTH_REALM || 'lifesheet',
  API_URL: process.env.API_URL || 'http://localhost:3000',
  PRIVATE_API_URL: process.env.PRIVATE_API_URL || 'http://localhost:3000',
  NODE_ENV: process.env.NODE_ENV || 'development',
  CV_TAILORING_SERVICE: process.env.CV_TAILORING_SERVICE || 'http://localhost:8000',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || 'throw',
  MODEL_NAME: process.env.MODEL_NAME || 'gemini-2.5-flash-lite',
  REDIS_PASSWORD: process.env.REDIS_PASSWORD || undefined,
  REDIS_HOST: process.env.REDIS_HOST || 'localhost',
  REDIS_PORT: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,
  REDIS_USERNAME: process.env.REDIS_USERNAME || undefined,
  STRIPE_PK: process.env.STRIPE_PK || 'throw',
  STRIPE_SK: process.env.STRIPE_SK || 'throw',
  STRIPE_WS: process.env.STRIPE_WS || 'throw',
};
const missing = Object.keys(constants).filter(
  key => constants[key as keyof typeof constants] === 'throw'
);
if (missing.length > 0) {
  throw new Error(
    'The following required environment variables are not set: ' + missing.join(', ')
  );
}
export const redisConfig = {
  host: constants.REDIS_HOST,
  port: constants.REDIS_PORT,
  password: constants.REDIS_PASSWORD,
  username: constants.REDIS_USERNAME,
  maxRetriesPerRequest: null,
};
