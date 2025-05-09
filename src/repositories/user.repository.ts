import { AppDataSource } from '../config/data-source';
import { CreateUserBody, GetUsersQuery } from '../dtos/user.dto';
import { User } from '../models/user.entity';

export class UserRepository {
	private repo = AppDataSource.getRepository<User>('User');

	async createUser(data: CreateUserBody) {
		const user = this.repo.create(data);
		return await this.repo.save(user);
	}

	async getAll(data: GetUsersQuery) {
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
