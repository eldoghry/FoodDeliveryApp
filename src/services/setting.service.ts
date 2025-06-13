import HttpStatusCodes from 'http-status-codes';
import logger from '../config/logger';
import ApplicationError from '../errors/application.error';
import ErrMessages from '../errors/error-messages';
import { SettingRepository } from '../repositories';
import { Setting } from '../models';

export class SettingService {
	private static settingRepo = new SettingRepository();

	static async get(key: string): Promise<any> {
		const sanitizedKey = this.sanitizeKey(key);
		const setting = await this.settingRepo.findByKey(sanitizedKey);

		if (!setting) throw new ApplicationError(ErrMessages.setting.SettingNotFound, HttpStatusCodes.NOT_FOUND);

		return setting.value;
	}

	static async getAll(): Promise<Setting[]> {
		return await this.settingRepo.findAll();
	}

	static async set(key: string, value: any, description?: string): Promise<Setting> {
		const sanitizedKey = this.sanitizeKey(key);
		return this.settingRepo.upsertByKey(sanitizedKey, value, description);
	}

	static async delete(key: string): Promise<void> {
		const sanitizedKey = this.sanitizeKey(key);
		await this.settingRepo.delete(sanitizedKey);
	}

	private static sanitizeKey(key: string): string {
		return key.trim().toUpperCase();
	}
}
