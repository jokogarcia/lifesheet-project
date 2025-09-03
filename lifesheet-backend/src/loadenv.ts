import dotenv from 'dotenv';
if(!process.env.NODE_ENV) {
  dotenv.config();
  console.log('Environment variables loaded from .env file');
}else{
  console.log('NODE_ENV is set, assuming environment variables are set externally');
}
