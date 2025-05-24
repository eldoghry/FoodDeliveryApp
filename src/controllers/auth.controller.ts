import { Request, Response } from 'express';
import { sendResponse } from '../utils/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { AuthService } from '../services/auth.service';

export class AuthController {
	private authService = new AuthService();

	async login(req: Request, res: Response) {
		const { email, password } = req.validated?.body;
		const tokens = await this.authService.login({ email, password });
		sendResponse(res, StatusCodes.OK, 'Login successfully', tokens);
	}
}
