import Redis from 'ioredis';
import redis from '../config/redis-client';
import { config } from '../config/env';

class RedisService {
  private redis: Redis;

  constructor() {
    this.redis = redis;
  }

  async get(key: string): Promise<any> {
    const data = await this.redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  async set(key: string, value: any, ttl: number = config.redis.ttl): Promise<void> {
    if (ttl === -1) await this.redis.set(key, JSON.stringify(value));
    else await this.redis.set(key, JSON.stringify(value), 'EX', ttl);
  }

  async del(key: string): Promise<void> {
    await this.redis.del(key);
  }
}

export const redisService = new RedisService();
