import HttpStatusCodes, { StatusCodes } from 'http-status-codes';
import ApplicationError from '../errors/application.error';
import { UserRepository } from '../repositories/user.repository';
import logger from '../config/logger';
import { User } from '../models/user/user.entity';
import { HashingService } from '../shared/secureHashing';
import { CreateUserDto, GetOneUserByDto } from '../dtos/user.dto';
import ErrMessages from '../errors/error-messages';

export class UserService {
	private userRepo = new UserRepository();

	async createUser(dto: CreateUserDto) {
		const hashedPassword = await HashingService.hash(dto.password);

		const newUser = await this.userRepo.createUser({ ...dto, password: hashedPassword });

		logger.info(`User created with ID: ${newUser.userId}`);

		return newUser;
	}

	async getActiveUsers(data: any) {
		return this.userRepo.getActiveUsers();
	}

	async getOne(id: number) {
		const user = await this.userRepo.getUserById(id);
		if (!user) throw new ApplicationError('User not found', HttpStatusCodes.NOT_FOUND);
		return user;
	}

	async getOneOrFailBy(filter: GetOneUserByDto) {
		if (Object.keys(filter).length === 0) throw new ApplicationError('Invalid filter', HttpStatusCodes.BAD_REQUEST);

		const user = await this.userRepo.getOneBy(filter);

		if (!user) throw new ApplicationError('User not found', HttpStatusCodes.NOT_FOUND);

		return user;
	}

	async getOneBy(filter: GetOneUserByDto) {
		if (Object.keys(filter).length === 0) return null;

		const user = await this.userRepo.getOneBy(filter);

		return user || null;
	}

	async comparePasswords(plainText: string, hashed: string): Promise<boolean> {
		return await HashingService.verify(plainText, hashed);
	}

	async deactivateUser(userId: number, deactivationInfo: User['deactivationInfo']): Promise<void> {
		await this.userRepo.deactivateUser(userId, deactivationInfo);
	}

	async getUserTypeByName(name: string) {
		return await this.userRepo.getUserTypeByName(name);
	}

	async ensureEmailUniqueness(email: string) {
		const user = await this.userRepo.getUserByEmail(email);
		if (user) throw new ApplicationError(ErrMessages.user.EmailAlreadyExists, StatusCodes.BAD_REQUEST);
	}

	async ensurePhoneUniqueness(phone: string) {
		const user = await this.userRepo.getUserByPhone(phone);
		if (user) throw new ApplicationError(ErrMessages.user.PhoneAlreadyExists, StatusCodes.BAD_REQUEST);
	}

	async checkIfEmailOrPhoneExist(email: string, phone: string): Promise<void> {
		const user = await this.userRepo.getUserByEmailOrPhone(email, phone);

		if (!user) return;
		if (user.email === email) throw new ApplicationError(ErrMessages.user.EmailAlreadyExists, StatusCodes.BAD_REQUEST);
		if (user.phone === phone) throw new ApplicationError(ErrMessages.user.PhoneAlreadyExists, StatusCodes.BAD_REQUEST);
	}
}
