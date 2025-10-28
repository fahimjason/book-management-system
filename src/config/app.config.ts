import { registerAs } from '@nestjs/config';
import * as dotenv from 'dotenv';

dotenv.config();

export default registerAs('app', () => ({
  name: process.env.APP_NAME || 'NestApp',
  env: process.env.APP_ENV || 'development',
  debug: process.env.APP_DEBUG === 'true',
}));
