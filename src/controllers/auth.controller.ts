import { Request, Response } from 'express';
import { sendResponse } from '../utils/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { AuthService } from '../services/auth.service';
import { RegisterCustomerDto, RegisterUserDto } from '../dtos/auth.dto';

export class AuthController {
	private authService = new AuthService();

	async login(req: Request, res: Response) {
		const { email, password } = req.validated?.body;
		const tokens = await this.authService.login({ email, password });
		// TODO: set cookie with security flags
		// res.cookie("refreshToken", tokens.refresh, {
		// 	httpOnly: true,   // JS can't read cookie (XSS protection)
		// 	secure: process.env.NODE_ENV === "production",     // Only sent over HTTPS
		// 	sameSite: "strict", // Prevents CSRF attacks
		// 	maxAge: 60, // 1 hour
		//   });
		sendResponse(res, StatusCodes.OK, 'Login successfully', tokens);
	}

	async registerCustomer(req: Request, res: Response) {
		const payload: RegisterCustomerDto = req.validated?.body;
		const customer = await this.authService.registerCustomer(payload);
		sendResponse(res, StatusCodes.CREATED, 'Customer registered successfully', customer);
	}

	async registerRestaurantOwner(req: Request, res: Response) {
		const payload: RegisterUserDto = req.validated?.body;
		const restaurantOwner = await this.authService.registerRestaurantOwner(payload);
		sendResponse(res, StatusCodes.CREATED, 'Registration successful. Awaiting admin approval.', restaurantOwner);
	}

	async requestOtp(req: Request, res: Response) {
		const { phone } = req.validated?.body;
		await this.authService.requestOtp(phone);
		sendResponse(res, StatusCodes.OK, 'OTP sent successfully');
	}

	async verifyOtp(req: Request, res: Response) {
		const { phone, otp } = req.validated?.body;
		const result = await this.authService.verifyOtp(phone, otp);
		sendResponse(res, StatusCodes.OK, 'OTP verified successfully', result);
	}

	async resetPassword(req: Request, res: Response) {
		const { phone, newPassword, resetToken } = req.validated?.body;
		await this.authService.resetPassword(phone, newPassword, resetToken);
		sendResponse(res, StatusCodes.OK, 'Password reset successfully');
	}
}
