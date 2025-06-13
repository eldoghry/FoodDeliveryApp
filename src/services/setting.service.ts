import HttpStatusCodes from 'http-status-codes';
import logger from '../config/logger';
import ApplicationError from '../errors/application.error';
import ErrMessages from '../errors/error-messages';
import { SettingRepository } from '../repositories';
import { Setting } from '../models';
import { redisService } from '../shared/redis';

export class SettingService {
	private static settingRepo = new SettingRepository();
	static REDIS_PREFIX = 'settings';

	static async get(key: string): Promise<any> {
		const sanitizedKey = this.sanitizeKey(key);
		// get from redis first

		const cachedKey = redisService.generateKey(this.REDIS_PREFIX, sanitizedKey);
		const cachedValue = await redisService.get(cachedKey, true);
		if (cachedValue !== null) return cachedValue;

		// get from database
		const setting = await this.settingRepo.findByKey(sanitizedKey);

		if (!setting) throw new ApplicationError(ErrMessages.setting.SettingNotFound, HttpStatusCodes.NOT_FOUND);

		// set to redis
		const result = setting.value;
		await redisService.set(cachedKey, result);
		return result;
	}

	static async getAll(): Promise<Setting[]> {
		return await this.settingRepo.findAll();
	}

	static async set(key: string, value: any, description?: string): Promise<Setting> {
		const sanitizedKey = this.sanitizeKey(key);
		const updated = await this.settingRepo.upsertByKey(sanitizedKey, value, description);
		const cachedKey = redisService.generateKey(this.REDIS_PREFIX, sanitizedKey);
		await redisService.set(cachedKey, updated.value);
		return updated;
	}

	static async delete(key: string): Promise<void> {
		const sanitizedKey = this.sanitizeKey(key);
		await this.settingRepo.delete(sanitizedKey);
		const cachedKey = redisService.generateKey(this.REDIS_PREFIX, sanitizedKey);
		await redisService.del(cachedKey);
	}

	private static sanitizeKey(key: string): string {
		return key.trim().toUpperCase();
	}
}
