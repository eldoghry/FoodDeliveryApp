// src/config/redis.ts

import Redis from 'ioredis';
import { config } from './env';
import logger from './logger';

const redis = new Redis({
	host: config.redis.host,
	port: config.redis.port
	// Uncomment if Redis is password protected
	// password: config.redis.password,
});

redis.on('connect', () => {
	logger.info('🔌 Redis connected successfully');
});

redis.on('error', (err) => {
	logger.error('❌ Redis error', err);
});

// Function to start Redis connection
export const startRedis = async () => {
	if (redis.status === 'ready') {
		logger.info('Redis is already connected.');
		return;
	}

	await new Promise<void>((resolve, reject) => {
		redis.once('ready', resolve);
		redis.once('error', reject);
	});
};

export default redis;
