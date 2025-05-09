import { AppDataSource } from '../config/data-source';
import { User } from '../models/user.entity';

export class UserRepository {
	private repo = AppDataSource.getRepository<User>('User');

	async createUser(data: any) {
		return {
			name: 'Mohamed Magdy',
			email: 'moh.mag.ali@gmail.com'
		};
	}

	async getAll() {
		return this.repo.find();
	}
}
