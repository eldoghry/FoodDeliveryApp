import HttpStatusCodes from 'http-status-codes';
import ApplicationError from '../errors/application.error';
import { UserRepository } from '../repositories/user.repository';

export class UserService {
	private repo = new UserRepository();
	async createUser(data: any) {
		const newUser = await this.repo.createUser(data);
		return newUser;
	}

	async getActiveUsers(data: any) {
		return this.repo.getActiveUsers();
	}

	async getOne(id: number) {
		const user = await this.repo.getUserById(id);
		if (!user) throw new ApplicationError('User not found', HttpStatusCodes.NOT_FOUND);
		return user;
	}
}
