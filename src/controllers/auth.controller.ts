import { Request, Response } from 'express';
import { sendResponse } from '../utils/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { AuthService } from '../services/auth.service';
import { RegisterCustomerDto } from '../dtos/auth.dto';

export class AuthController {
	private authService = new AuthService();

	async login(req: Request, res: Response) {
		const { email, password } = req.validated?.body;
		const tokens = await this.authService.login({ email, password });
		sendResponse(res, StatusCodes.OK, 'Login successfully', tokens);
	}

	async registerCustomer(req: Request, res: Response) {
		const payload: RegisterCustomerDto = req.validated?.body;
		const customer = await this.authService.registerCustomer(payload);
		sendResponse(res, StatusCodes.CREATED, 'Customer registered successfully', customer);
	}
}
