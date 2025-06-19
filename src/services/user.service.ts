import HttpStatusCodes from 'http-status-codes';
import ApplicationError from '../errors/application.error';
import { UserRepository } from '../repositories/user.repository';
import logger from '../config/logger';
import { User } from '../models/user/user.entity';
import { HashingService } from '../shared/secureHashing';
import { CreateUserDto, GetOneUserByDto } from '../dtos/user.dto';

export class UserService {
	private repo = new UserRepository();

	async createUser(dto: CreateUserDto) {
		const hashedPassword = await HashingService.hash(dto.password);

		const newUser = await this.repo.createUser({ ...dto, password: hashedPassword });

		logger.info(`User created with ID: ${newUser.userId}`);

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

	async getOneOrFailBy(filter: GetOneUserByDto) {
		if (Object.keys(filter).length === 0) throw new ApplicationError('Invalid filter', HttpStatusCodes.BAD_REQUEST);

		const user = await this.repo.getOneBy(filter);

		if (!user) throw new ApplicationError('User not found', HttpStatusCodes.NOT_FOUND);

		return user;
	}

	async getOneBy(filter: GetOneUserByDto) {
		if (Object.keys(filter).length === 0) return null;

		const user = await this.repo.getOneBy(filter);

		return user || null;
	}

	async comparePasswords(plainText: string, hashed: string): Promise<boolean> {
		return await HashingService.verify(plainText, hashed);
	}

	async deactivateUser(userId: number, deactivationInfo: User['deactivationInfo']): Promise<void> {
		await this.repo.deactivateUser(userId, deactivationInfo);
	}
}
