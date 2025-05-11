import { AppDataSource } from '../config/data-source';
import { User } from '../models/user.entity';

export class UserRepository {
	private repo = AppDataSource.getRepository<User>('User');

	async createUser(data: any) {
		const user = this.repo.create(data);
		return await this.repo.save(user);
	}

	async getAll(data: { limit: number }) {
		return this.repo.find({ take: data.limit });
	}

	async getOne(id: number) {
		return this.repo.findOne({
			where: {
				id
			}
		});
	}
}
