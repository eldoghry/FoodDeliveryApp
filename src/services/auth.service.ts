import { UserService } from './user.service';
import { config } from '../config/env';
import { AuthorizedUser } from '../middlewares/auth.middleware';
import { UserRepository } from '../repositories/user.repository';
import { JwtService } from '../shared/jwt';
import { AuthLoginDto, RegisterCustomerDto } from '../dtos/auth.dto';
import { StatusCodes } from 'http-status-codes';
import ApplicationError from '../errors/application.error';
import { Transactional } from 'typeorm-transactional';
import { CustomerService } from './customer.service';
import { Gender, UserType } from '../models';

export class AuthService {
	private repo = new UserRepository();
	private jwtService = new JwtService();
	private userService = new UserService();
	private customerService = new CustomerService();

	async login(dto: AuthLoginDto) {
		const user = await this.validateAndGetUser(dto);
		const userType = user.userType.name;
		let actorId = userType === 'customer' ? user.customer.customerId : user.userId; // TODO: create user restaurant enitity

		const payload: AuthorizedUser = {
			userId: user.userId,
			roles: user.roles.map((role) => role.name),
			actorType: user.userType.name,
			actorId // TODO: This should be replaced with actual actor ID after authentication
		};

		let loginPayload = null;

		if (userType.includes('restaurant')) {
			loginPayload = {
				...payload,
				restaurantId: user.restaurant[0].restaurantId
			};
		} else {
			loginPayload = payload;
		}

		const tokens = this.generateTokens(loginPayload);

		return tokens;
	}

	generateTokens(payload: AuthorizedUser) {
		const token = this.jwtService.sign(payload);
		const refresh = this.jwtService.sign(payload, {
			expiresIn: config.jwt.refreshTTL
		});

		return { token, refresh };
	}

	async validateAndGetUser(dto: AuthLoginDto) {
		const user = await this.userService.getOneOrFailBy({
			email: dto.email,
			withPassword: true,
			relations: ['roles', 'userType', 'customer', 'restaurant']
		});

		if (!user.isActive) throw new ApplicationError('User is inactive', StatusCodes.UNAUTHORIZED);

		const isPasswordValid = await this.userService.comparePasswords(dto.password, user.password);

		if (!isPasswordValid) throw new ApplicationError('Invalid credentials', StatusCodes.UNAUTHORIZED);

		const userWithOutPassword = { ...user, password: undefined };
		return userWithOutPassword;
	}

	async logout() {
		// todo
	}

	@Transactional()
	async registerCustomer(dto: RegisterCustomerDto) {
		// 1) validate email or phone not exists
		await this.userService.checkIfEmailOrPhoneExist(dto.email, dto.phone);

		// 2) create user record
		const userType = (await this.userService.getUserTypeByName('customer')) as UserType;
		const newUser = await this.userService.createUser({ ...dto, userTypeId: userType.userTypeId });

		// 3) create customer record
		const newCustomer = await this.customerService.createCustomer({
			birthDate: dto.birthDate,
			gender: dto.gender as Gender,
			userId: newUser.userId
		});

		// 4) create Authorize payload
		const payload: AuthorizedUser = {
			userId: newUser.userId,
			roles: newUser?.roles?.map((role) => role.name) || [],
			actorType: userType?.name,
			actorId: newCustomer.customerId
		};

		// 3) generate tokens
		const tokens = this.generateTokens(payload);

		return tokens;
	}

	async forgetPassword() {
		// todo
	}
}
