import { UserService } from './user.service';
import { config } from '../config/env';
import { AuthorizedUser } from '../middlewares/auth.middleware';
import { UserRepository } from '../repositories/user.repository';
import { JwtService } from '../shared/jwt';
import { AuthLoginDto } from '../dtos/auth.dto';
import { StatusCodes } from 'http-status-codes';
import ApplicationError from '../errors/application.error';

export class AuthService {
	private repo = new UserRepository();
	private jwtService = new JwtService();
	private userService = new UserService();

	async login(dto: AuthLoginDto) {
		const user = await this.validateUser(dto);
		const userType = user.userType.name;
		let actorId = userType === 'customer' ? user.customer.customerId : user.userId; // TODO: create user restaurant enitity

		const payload: AuthorizedUser = {
			userId: user.userId,
			roles: user.roles.map((role) => role.name),
			actorType: user.userType.name,
			actorId // TODO: This should be replaced with actual actor ID after authentication
		};

		let loginPayload = null;
		
		if(userType.includes('restaurant')) {
			loginPayload = {
				...payload,
				restaurantId: user.restaurant.restaurantId,
			}
		}else{
			loginPayload = payload;
		}

		const token = this.jwtService.sign(loginPayload);
		const refresh = this.jwtService.sign(loginPayload, {
			expiresIn: config.jwt.refreshTTL
		});

		return { token, refresh };
	}

	async validateUser(dto: AuthLoginDto) {
		const user = await this.userService.getOneOrFailBy({
			email: dto.email,
			withPassword: true,
			relations: ['roles', 'userType', 'customer', 'restaurant']
		});

		if (!user.isActive) throw new ApplicationError('User is inactive', StatusCodes.UNAUTHORIZED);

		const isValid = await this.userService.comparePasswords(dto.password, user.password);

		if (!isValid) throw new ApplicationError('Invalid credentials', StatusCodes.UNAUTHORIZED);

		const userWithOutPassword = { ...user, password: undefined };
		return userWithOutPassword;
	}

	async logout() {
		// todo
	}

	async register() {
		// todo
	}

	async forgetPassword() {
		// todo
	}
}
