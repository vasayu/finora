import { createClient } from 'redis';
import { env } from './env';
import logger from '../utils/logger';

export const redis = createClient({
    url: env.REDIS_URL
});

redis.on('error', (err) => logger.error('Redis Client Error', err));
redis.on('connect', () => logger.info('Redis Client Connected'));

export const connectRedis = async () => {
    if (!redis.isOpen) {
        await redis.connect();
    }
};
