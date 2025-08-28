export const constants ={
    PORT: process.env.PORT || 3000,
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/myapp',
    AUTH_DOMAIN: process.env.AUTH_DOMAIN || 'throw',
    AUTH_AUDIENCE: process.env.AUTH_AUDIENCE || 'throw',
    API_URL: process.env.API_URL || 'http://localhost:3000',
    PRIVATE_API_URL: process.env.PRIVATE_API_URL || 'http://localhost:3000',
    NODE_ENV: process.env.NODE_ENV || 'development',
    CV_TAILORING_SERVICE: process.env.CV_TAILORING_SERVICE || 'http://localhost:8000',
    GEMINI_API_KEY: process.env.GEMINI_API_KEY || 'throw',
};
const missing = Object.keys(constants).filter(key => constants[key as keyof typeof constants] === 'throw');
if (missing.length > 0) {
    throw new Error('The following required environment variables are not set: ' + missing.join(', '));
}