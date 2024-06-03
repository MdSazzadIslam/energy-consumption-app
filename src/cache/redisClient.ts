import Redis from 'ioredis';
import logger from '../utils/logger';

const redisOptions = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT as string, 10) || 6379,
    retryStrategy: (times: number) => Math.min(times * 50, 2000),
    reconnectOnError: (err: Error) => {
        const targetError = "READONLY";
        if (err.message.includes(targetError)) {
            // Only reconnect when the error contains "READONLY"
            return true;
        }
        return false;
    }
};

const redis = new Redis(redisOptions);

export async function getCachedData<T>(key: string): Promise<T | null> {
    try {
        const data = await redis.get(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        logger.error(`Error getting cached data for key ${key}:`, error);
        return null;
    }
}

export async function setCachedData<T>(key: string, value: T, ttl: number): Promise<void> {
    try {
        await redis.set(key, JSON.stringify(value), 'EX', ttl);
    } catch (error) {
        logger.error(`Error setting cached data for key ${key}:`, error);
    }
}

export async function closeRedis(): Promise<void> {
    try {
        await redis.quit();
    } catch (error) {
        logger.error('Error closing Redis connection:', error);
    }
}
