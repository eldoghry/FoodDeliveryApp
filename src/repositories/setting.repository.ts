import { AppDataSource } from '../config/data-source';
import { Setting } from '../models/setting/setting.entity';
import { Repository } from 'typeorm';

export class SettingRepository {
	private repo: Repository<Setting>;

	constructor() {
		this.repo = AppDataSource.getRepository(Setting);
	}

	async findByKey(key: string): Promise<any> {
		return await this.repo.findOne({ where: { key } });
	}

	async upsertByKey(key: string, value: any, description?: string): Promise<Setting> {
		let setting = await this.findByKey(key);

		if (!setting) {
			setting = this.repo.create({ key, value });
		} else {
			setting.value = value;
		}

		if (description) setting.description = description;

		return await this.repo.save(setting);
	}

	async findAll(): Promise<Setting[]> {
		return await this.repo.find();
	}

	async delete(key: string): Promise<void> {
		await this.repo.delete({ key });
	}
}
