import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.string().default('5000'),
    DATABASE_URL: z.string(),
    JWT_SECRET: z.string(),
    JWT_EXPIRES_IN: z.string().default('15m'),
    JWT_REFRESH_SECRET: z.string(),
    JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
    CLOUDINARY_CLOUD_NAME: z.string(),
    CLOUDINARY_API_KEY: z.string(),
    CLOUDINARY_API_SECRET: z.string(),
    OPENAI_API_KEY: z.string().default(''),
    RAG_SERVICE_URL: z.string().default('http://rag-service:8000'),
    REDIS_URL: z.string().optional(),
    RABBITMQ_URL: z.string().optional(),
    PINATA_APIKEY: z.string(),
    PINATA_SECRETKEY: z.string(),
    TELEGRAM_BOT_TOKEN: z.string().optional(),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
    console.error('❌ Invalid environment variables', _env.error.format());
    throw new Error('Invalid environment variables');
}

export const env = _env.data;
