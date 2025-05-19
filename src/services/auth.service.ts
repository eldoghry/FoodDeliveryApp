import HttpStatusCodes from 'http-status-codes';
import ApplicationError from '../errors/application.error';
import { UserRepository } from '../repositories/user.repository';
import { JwtService } from '../shared/jwt';
import { config } from '../config/env';

export class AuthService {
	private repo = new UserRepository();
	private jwtService = new JwtService();

	async login(data: any) {
		// todo: implement login logic
		const payload = { userId: 1 };
		const token = this.jwtService.sign(payload);
		const refresh = this.jwtService.sign(payload, {
			expiresIn: config.jwt.refreshTTL
		});

		return { token, refresh };
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
